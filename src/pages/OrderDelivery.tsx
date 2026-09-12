import OrderStageScreen from '../components/OrderStageScreen'

/** Kurir sedang menuju alamat pengiriman — satu-satunya tahap di mana peta layak dominan. */
export default function OrderDelivery() {
  return <OrderStageScreen stage="diantar" />
}
