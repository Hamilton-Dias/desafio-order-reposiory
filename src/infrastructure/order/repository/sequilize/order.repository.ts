import Order from "../../../../domain/checkout/entity/order";
import OrderItem from "../../../../domain/checkout/entity/order_item";
import OrderRepositoryInterface from "../../../../domain/checkout/repository/order-repository.interface";
import OrderItemModel from "./order-item.model";
import OrderModel from "./order.model";

export default class OrderRepository implements OrderRepositoryInterface {
  async create(entity: Order): Promise<void> {
    await OrderModel.create(
      {
        id: entity.id,
        customer_id: entity.customerId,
        total: entity.total(),
        items: entity.items.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          product_id: item.productId,
          quantity: item.quantity,
        })),
      },
      {
        include: [{ model: OrderItemModel }],
      }
    );
  }

  async update(entity: Order): Promise<void> {
    await OrderModel.update(
      {
        customer_id: entity.customerId,
        total: entity.total(),
      },
      {
        where: {
          id: entity.id,
        },
      }
    );

    if (entity.items.length) {
      const itensIds = entity.items.map(item => item.id);

      await OrderModel.findOne({where: {id: entity.id}, include: ["items"]}).then(order => {
        if (order.items.length) {
          order.items.map(item => {
            if (!itensIds.includes(item.id)) {
              item.destroy();
            }
          })
        }
      });

      //TODO: adicionar item?
    }
  }

  async find(id: string): Promise<Order> {
    const orderModel = await OrderModel.findOne({ where: { id }, include: ["items"] });

    let itens: OrderItem[] = [];

    if (orderModel.items.length) {
      orderModel.items.forEach(item => {
        const orderItem = new OrderItem(
          item.id,
          item.name,
          item.price,
          item.product_id,
          item.quantity
        );
  
        itens.push(orderItem);
      });
    }

    return new Order(orderModel.id, orderModel.customer_id, itens);
  }

  async findAll(): Promise<Order[]> {
    const orderModels = await OrderModel.findAll({include: ["items"]});
    return orderModels.map((orderModel) => {

      let itens: OrderItem[] = [];

      if (orderModel.items.length) {
        orderModel.items.forEach(item => {
          const orderItem = new OrderItem(
            item.id,
            item.name,
            item.price,
            item.product_id,
            item.quantity
          );
  
          itens.push(orderItem);
        });
      }

      return new Order(orderModel.id, orderModel.customer_id, itens);
    });
  }
}
