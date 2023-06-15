import { useEffect, useState } from "react";
import { axiosInstance } from "../axios";
import jwtDecode from "jwt-decode";
import { IDish } from "../types";
import { IconCheck, IconMinus } from "@tabler/icons-react";
import { DataTable } from "mantine-datatable";
import { Button, useMantineTheme } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { closeAllModals, openModal } from "@mantine/modals";

export const Order_buffet = () => {
  const token = localStorage.getItem("token")!;
  const user: any = jwtDecode(token);
  const [resultParse_Orders, setResultParse] = useState<any[]>([]);
  const [kids, setKids] = useState<any[]>([]);

  useEffect(() => {
    const fetchOrderBuffet = async () => {
      const result = await axiosInstance.get("/Get");



      const resultParse_Orders = result.data.data.map((qwe: string) => JSON.parse(qwe));
      const resultParse_Orders_Buf = resultParse_Orders.filter((qwe: any) => qwe.Menu
      .$type === "BuffetMenu")
      .map((qwe: any) => qwe);
      console.log(resultParse_Orders_Buf)
      setResultParse(resultParse_Orders_Buf);

      const resultKid = await axiosInstance.get("/api/Account/GetPersons?Role=schoolKid", {
        headers: { authorization: `Bearer ${token}` },
      });
      
      const parseResultKid = resultKid.data.data.map((qwe: string) => JSON.parse(qwe));
      setKids(parseResultKid);
    };
    fetchOrderBuffet();
  }, [token]);

  const onAccept = async(rowData: any) => {
    const response = await axiosInstance.delete(`/Delete?orderId=${rowData.Id}`,
    { headers: { authorization: `Bearer ${token}` } })
    if (response.data.statusCode === 200) {
      showNotification({
        title: "Успешно",
        message: `Заказ Принят`,
        color: "teal",
      });
      setResultParse(resultParse_Orders.filter((s: any) => s.Id !== rowData.Id));
      closeAllModals();
    } else {
      showNotification({
        title: "Произошла ошибка",
        message: "Произошла неизвестная ошибка",
        color: "red",
      });
    }
    console.log("Accept", rowData);
  };

  const onReject = async(rowData: any) => {
    const response = await axiosInstance.delete(`/Delete?orderId=${rowData.Id}`,
    { headers: { authorization: `Bearer ${token}` } })
    console.log(response)
    if (response.data.statusCode === 200) {
      showNotification({
        title: "Успешно",
        message: `Заказ Откланён`,
        color: "teal",
      });
      setResultParse(resultParse_Orders.filter((s: any) => s.Id !== rowData.Id));
      closeAllModals();
    } else {
      showNotification({
        title: "Произошла ошибка",
        message: "Произошла неизвестная ошибка",
        color: "red",
      });
    }
    console.log("Reject", rowData);
  };

  return (
    <DataTable
      withBorder
      borderRadius="sm"
      withColumnBorders
      striped
      highlightOnHover
      columns={[
        {
          accessor: "number",
          title: "№",
          render: (record, key) => key + 1 ,
        },
        {
          accessor: "order_dish",
          title: "Заказ",
          sortable: false,
          render: (rowData: any) =>
            rowData.Dishes.map((dish: any) => dish.Title + " "),
        },
        {
          accessor: "customer",
          title: "Покупатель",
          sortable: false,
          render: (rowData: any) =>{
            const customer = kids?.find((m: any) => m?.Id === rowData?.SchoolKidId);
            return customer ? customer.Name : "";
          },
        },
        {
          accessor: "+/-",
          title: "Принять/отклонить",
          sortable: false,
          render: (rowData: any) => (
            <>
              <Button
                style={{ marginLeft: "10px" }}
                compact
                onClick={() => onAccept(rowData)}
              >
                <IconCheck />
              </Button>
              <Button
                style={{ marginLeft: "10px" }}
                compact
                color="red"
                onClick={() => onReject(rowData)}
              >
                <IconMinus />
              </Button>
            </>
          ),
        },
      ]}
      records={resultParse_Orders}
    />
  );
};
