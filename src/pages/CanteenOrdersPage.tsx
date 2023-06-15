import { DataTable } from "mantine-datatable";
import { useEffect, useState } from "react";
import { axiosInstance } from "../axios";
import { Box, Button, Navbar, NavLink } from "@mantine/core";

export const CanteenOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [classes, setClasses] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [tableData, setTableData] = useState<any>({});

  useEffect(() => {
    const fetchData = async () => {
      const token = "your_auth_token_here";

      const responseOrders = await axiosInstance.get("/Get", {
        headers: { authorization: `Bearer ${token}` },
      });
      const parsedOrders = responseOrders.data.data.map((qwe: string) => JSON.parse(qwe));
      setOrders(parsedOrders);

      const responseClasses = await axiosInstance.get("/api/Class/GetClasses", {
        headers: { authorization: `Bearer ${token}` },
      });
      const parsedClasses = responseClasses.data.data.map((qwe: string) => JSON.parse(qwe));
      setClasses(parsedClasses);

      const responseDishes = await axiosInstance.get("/api/Dishes", {
        headers: { authorization: `Bearer ${token}` },
      });
      const parsedDishes = responseDishes.data.data.map((qwe: string) => JSON.parse(qwe));
      setDishes(parsedDishes);
    };

    fetchData();
  }, []);

  useEffect(() => {
    // organize orders by class and dish
    const data:any = {};
    orders.forEach((order:any) => {
      const schoolKidId = order.SchoolKidId;
      const classObj:any = classes.find((c:any) => c.SchoolKidIds.includes(schoolKidId));
      if (!classObj) return;

      const className = classObj.Title;

      order.DishesIds.forEach((dishId:any) => {
        const dish:any = dishes.find((d:any) => d.Id === dishId);
        if (!dish) return;

        const dishName:any = dish.Title;

        if (!data[className]) data[className] = {};
        if (!data[className][dishName]) data[className][dishName] = 0;

        data[className][dishName]++;
      });
    });

    setTableData(data);
  }, [orders, classes, dishes]);
  console.log(orders)
  return (
    <>
    <DataTable
  withBorder
  borderRadius="sm"
  withColumnBorders
  minHeight={100}
  striped
  highlightOnHover
  columns={[
    {
      accessor: "Title",
      title: "Class"
    },
    {
      accessor: "DishesIds",
      title: "Number of Dishes",
      render: (record:any) => record.DishesIds.length,
    },
  ]}
  records={orders}
/>
      <h1>Table</h1>
      <table>
        <thead>
          <tr>
            <th>Class</th>
            {dishes.map((dish:any) => (
              <th key={dish.Id}>{dish.Title}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Object.keys(tableData).map((className:any) => (
            <tr key={className}>
              <td>{className}</td>
              {dishes.map((dish:any) => (
                <td key={dish.Id}>{tableData[className]?.[dish.Title] || 0}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}