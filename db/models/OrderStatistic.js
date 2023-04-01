import mongoose from 'mongoose';

const OrderStatisticSchema = new mongoose.Schema({
  mostPopularCategory: { en: String, ua: String },
  profitOfDeliveredOrders: Number,
  profitOfPendingOrders: Number,
});

const OrderStatistic = mongoose.model('Order_Statistic', OrderStatisticSchema);

export default OrderStatistic;
