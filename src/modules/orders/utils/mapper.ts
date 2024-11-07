// @ts-nocheck
import type { Order } from '../pages/orders.data';
import type { OrderToBeAcknowledged, AcknowledgeableOrderList } from '../types/types';

export const mapAcknowledgeableOrderList = (orders: Order[]): AcknowledgeableOrderList => {
    const ordersToBeAcknowledge: AcknowledgeableOrderList = {};

    orders.map(order => {
        const marketplace_id = order.marketplace_id.id;

        if (ordersToBeAcknowledge[marketplace_id] == null) {
            ordersToBeAcknowledge[marketplace_id] = [];
        }

        let orderToBeAcknowledged: OrderToBeAcknowledged = {};

        switch (order.marketplace_id.name) {
            case 'walmart':
                orderToBeAcknowledged = {
                    orderId: order.order_id,
                    orderAcknowledge: {
                        orderLines: {
                            orderLine: order.order_lines?.flatMap(ol => {
                                // biome-ignore lint/suspicious/noExplicitAny: <explanation>
                                return ol?.shipment?.shipmentLines.map((sl: any) => ({
                                    lineNumber: sl.primeLineNo,
                                    orderLineStatuses: {
                                        orderLineStatus: [
                                            {
                                                status: 'Acknowledged',
                                                statusQuantity: {
                                                    unitOfMeasurement: sl.quantity.unitOfMeasurement,
                                                    amount: sl.quantity.amount,
                                                },
                                            },
                                        ],
                                    },
                                }));
                            }),
                        },
                    },
                };
                break;
            case 'liverpool':
                break;
            case 'coppel':
                break;
        }

        ordersToBeAcknowledge[order.marketplace_id.id].push(orderToBeAcknowledged);
    });

    return ordersToBeAcknowledge;
};
