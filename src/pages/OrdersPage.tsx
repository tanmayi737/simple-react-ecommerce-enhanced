import { FC } from "react";
import OrderHistory from "../components/OrderHistory";

const OrdersPage: FC = () => {
  return (
    <div className="container mx-auto min-h-[83vh] p-4 font-karla max-w-5xl">
      <OrderHistory />
    </div>
  );
};

export default OrdersPage;
