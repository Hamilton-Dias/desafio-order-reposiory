import Customer from "../../customer/entity/customer";
import CustomerAdressChangedEvent from "../../customer/event/customer-address-changed.event";
import CustomerCreatedEvent from "../../customer/event/customer-created.event";
import EnviaConsoleLog1Handler from "../../customer/event/handler/envia-console-log-1.handler";
import EnviaConsoleLog2Handler from "../../customer/event/handler/envia-console-log-2.handler";
import EnviaConsoleLogHandler from "../../customer/event/handler/envia-console-log.handler";
import Address from "../../customer/value-object/address";
import SendEmailWhenProductIsCreatedHandler from "../../product/event/handler/send-email-when-product-is-created.handler";
import ProductCreatedEvent from "../../product/event/product-created.event";
import EventDispatcher from "./event-dispatcher";

describe("Domain events tests", () => {
  it("should register an event handler", () => {
    const eventDispatcher = new EventDispatcher();
    const eventHandler = new SendEmailWhenProductIsCreatedHandler();

    eventDispatcher.register("ProductCreatedEvent", eventHandler);

    expect(
      eventDispatcher.getEventHandlers["ProductCreatedEvent"]
    ).toBeDefined();
    expect(eventDispatcher.getEventHandlers["ProductCreatedEvent"].length).toBe(
      1
    );
    expect(
      eventDispatcher.getEventHandlers["ProductCreatedEvent"][0]
    ).toMatchObject(eventHandler);
  });

  it("should unregister an event handler", () => {
    const eventDispatcher = new EventDispatcher();
    const eventHandler = new SendEmailWhenProductIsCreatedHandler();

    eventDispatcher.register("ProductCreatedEvent", eventHandler);

    expect(
      eventDispatcher.getEventHandlers["ProductCreatedEvent"][0]
    ).toMatchObject(eventHandler);

    eventDispatcher.unregister("ProductCreatedEvent", eventHandler);

    expect(
      eventDispatcher.getEventHandlers["ProductCreatedEvent"]
    ).toBeDefined();
    expect(eventDispatcher.getEventHandlers["ProductCreatedEvent"].length).toBe(
      0
    );
  });

  it("should unregister all event handlers", () => {
    const eventDispatcher = new EventDispatcher();
    const eventHandler = new SendEmailWhenProductIsCreatedHandler();

    eventDispatcher.register("ProductCreatedEvent", eventHandler);

    expect(
      eventDispatcher.getEventHandlers["ProductCreatedEvent"][0]
    ).toMatchObject(eventHandler);

    eventDispatcher.unregisterAll();

    expect(
      eventDispatcher.getEventHandlers["ProductCreatedEvent"]
    ).toBeUndefined();
  });

  it("should notify all event handlers", () => {
    const eventDispatcher = new EventDispatcher();
    const eventHandler = new SendEmailWhenProductIsCreatedHandler();
    const spyEventHandler = jest.spyOn(eventHandler, "handle");

    eventDispatcher.register("ProductCreatedEvent", eventHandler);

    expect(
      eventDispatcher.getEventHandlers["ProductCreatedEvent"][0]
    ).toMatchObject(eventHandler);

    const productCreatedEvent = new ProductCreatedEvent({
      name: "Product 1",
      description: "Product 1 description",
      price: 10.0,
    });

    // Quando o notify for executado o SendEmailWhenProductIsCreatedHandler.handle() deve ser chamado
    eventDispatcher.notify(productCreatedEvent);

    expect(spyEventHandler).toHaveBeenCalled();
  });

  it("should notify all event handlers when customer created", () => {
    const eventDispatcher = new EventDispatcher();
    const eventHandler1 = new EnviaConsoleLog1Handler();
    const eventHandler2 = new EnviaConsoleLog2Handler();
    const spyEventHandler = jest.spyOn(eventHandler1, "handle");
    const spyEventHandler2 = jest.spyOn(eventHandler2, "handle");

    eventDispatcher.register("CustomerCreatedEvent", eventHandler1);
    eventDispatcher.register("CustomerCreatedEvent", eventHandler2);

    expect(
      eventDispatcher.getEventHandlers["CustomerCreatedEvent"][0]
    ).toMatchObject(eventHandler1);

    expect(
      eventDispatcher.getEventHandlers["CustomerCreatedEvent"][1]
    ).toMatchObject(eventHandler2);

    const customer = new Customer("123", "Customer 1");
    const address = new Address("street 1", 1, "12312-123", "Criciúma");
    customer.Address = address;

    const customerCreatedEvent = new CustomerCreatedEvent(customer);

    eventDispatcher.notify(customerCreatedEvent);

    expect(spyEventHandler).toHaveBeenCalled();
    expect(spyEventHandler2).toHaveBeenCalled();
  });

  it("should notify all event handlers when customer address changed", () => {
    const eventDispatcher = new EventDispatcher();
    const eventHandler = new EnviaConsoleLogHandler();
    const spyEventHandler = jest.spyOn(eventHandler, "handle");

    eventDispatcher.register("CustomerAdressChangedEvent", eventHandler);

    expect(
      eventDispatcher.getEventHandlers["CustomerAdressChangedEvent"][0]
    ).toMatchObject(eventHandler);

    const customer = new Customer("123", "Customer 1");
    const address = new Address("street 1", 1, "12312-123", "Criciúma");
    customer.Address = address;

    const address2 = new Address("street 2", 2, "12222-222", "Criciúma");
    customer.Address = address2;

    const customerAdressChangedEvent = new CustomerAdressChangedEvent(customer);

    eventDispatcher.notify(customerAdressChangedEvent);

    expect(spyEventHandler).toHaveBeenCalled();
  });

});
