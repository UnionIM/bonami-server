import mongoose from 'mongoose';

const OrderStatisticSchema = new mongoose.Schema({
  profitOfDeliveredOrders: Number,
  profitOfPendingOrders: Number,
});

const OrderStatistic = mongoose.model('Order_Statistic', OrderStatisticSchema);

export default OrderStatistic;
