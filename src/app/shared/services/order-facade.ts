import { Injectable, computed, inject, signal } from "@angular/core";
import { RealtimeChannel } from "@supabase/supabase-js";
import { OrderService, OrderWithDetails, Order } from "@pour-decisions/supabase";

@Injectable({providedIn: "root"})
export class OrderFacade {
  private readonly orderService = inject(OrderService);

  private readonly ordersByGuest = signal<Map<string, OrderWithDetails[]>>(new Map());
  private readonly subscriptions = signal<Map<string, RealtimeChannel>>(new Map());

  public readonly getOrders = computed(() => this.ordersByGuest());

  public getOrdersForGuest(guestId: string): OrderWithDetails[] {
    return this.ordersByGuest().get(guestId) ?? [];
  }

  public async loadOrdersForGuest(guestId: string): Promise<void> {
    const orders = await this.orderService.getOrdersForGuest(guestId);
    this.ordersByGuest.update((current) => {
      const next = new Map(current);
      next.set(guestId, orders);
      return next;
    });
  }

  public clearGuestOrders(guestId: string): void {
    this.ordersByGuest.update((current) => {
      const next = new Map(current);
      next.delete(guestId);
      return next;
    });

    this.teardownGuestSubscription(guestId);
  }

  public ensureGuestSubscription(guestId: string): void {
    const existing = this.subscriptions().get(guestId);
    if (existing) return;

    const channel = this.orderService.onGuestOrderChanges(
      guestId,
      (payload) => {
        const updatedOrder = payload.new as Order;
        this.ordersByGuest.update((map) => {
          const next = new Map(map);
          const list = next.get(guestId) ?? [];
          const updated = list.map((order) =>
            order.id === updatedOrder.id ? { ...order, status: updatedOrder.status } : order,
          );
          next.set(guestId, updated);
          return next;
        });
      },
    );

    this.subscriptions.update((subs) => {
      const next = new Map(subs);
      next.set(guestId, channel);
      return next;
    });
  }

  public teardownGuestSubscription(guestId: string): void {
    const channel = this.subscriptions().get(guestId);
    if (channel) {
      this.orderService.removeSubscription(channel);
      this.subscriptions.update((subs) => {
        const next = new Map(subs);
        next.delete(guestId);
        return next;
      });
    }
  }
}
