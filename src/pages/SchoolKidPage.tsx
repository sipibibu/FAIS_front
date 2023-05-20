import { useEffect, useState } from "react";
import jwtDecode from "jwt-decode";
import { Table, Text } from "@mantine/core";
import { axiosInstance } from "../axios";
import { DataTable } from "mantine-datatable";
import { Button, useMantineTheme } from "@mantine/core";
import { IconCheck, IconMinus } from "@tabler/icons-react";
import { showNotification } from "@mantine/notifications";
import { closeAllModals, openModal } from "@mantine/modals";

export const SchoolkidPage = () => {
  const token = localStorage.getItem("token")!;
  const user: any = jwtDecode(token);
  const [orders, setOrders] = useState<any[]>([]);

  const fetchOrders = async () => {
    const result = await axiosInstance.get(`/GetSchoolKidsOrders?schoolKidId=${user.personId}`);
    let parse_result=result.data.data.map((qwe: string)  => JSON.parse(qwe))
    console.log(parse_result)
    setOrders(parse_result);
  };

  useEffect(() => {
    fetchOrders();
  }, []);



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
      setOrders(orders.filter((s: any) => s.Id !== rowData.Id));
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
      columns ={ [
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
          accessor: "+/-",
          title: "Отмена",
          sortable: false,
          render: (rowData: any) => (
            <>
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
      records={orders}
    />

  );
};