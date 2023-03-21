import { useEffect, useState } from "react";
import { axiosInstance } from "../axios";
import jwtDecode from "jwt-decode";
import { IDish } from "../types";
import { IconCheck,IconMinus } from "@tabler/icons-react";
import { Button,useMantineTheme,Table } from "@mantine/core";


type Order = {
  id: number;
  orderName: string;
  customerName: string;
}

type Props = {
  orders: Order[];
}
export const Order_buffet = () => {
  const token = localStorage.getItem("token")!;
  const user: any = jwtDecode(token);

  useEffect(() => {
    const fetch_Order_Buffet = async () => {
      const result = await axiosInstance.get(
        `/api/Account/GetTrustesSchoolKids?trusteeId=${user.id}`
      );
    };
    fetch_Order_Buffet();
  }, []);


    const orders = [
      {
        id: 1,
        orderName: 'Order 1',
        customerName: 'John Doe'
      },
      {
        id: 2,
        orderName: 'Order 2',
        customerName: 'Jane Smith'
      },
      {
        id: 3,
        orderName: 'Order 3',
        customerName: 'Bob Johnson'
      },
      {
        id: 4,
        orderName: 'Order 4',
        customerName: 'Sarah Lee'
      },
    ];
    


    const [qrData, setQrData] = useState('');

  // handleChange function to handle user input
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQrData(event.target.value);
  };
    return (
      <>
      <Table withColumnBorders >
        <thead>
          <tr>
            <th>№</th>
            <th>Заказ</th>
            <th>Заказчик</th>
            <th>Принять/отконить</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td>{order.id}</td>
              <td>{order.orderName}</td>
              <td>{order.customerName}</td>
              <td>
              <Button style={{ marginLeft: '10px' }} compact onClick={() => onAccept(order)}><IconCheck /></Button>
              <Button style={{ marginLeft: '10px' }} compact color="red" onClick={() => onReject(order)}>
                <IconMinus />
              </Button>
            </td>
            </tr>
          ))}
        </tbody>
      </Table>
      
      </>
    );
  

};
