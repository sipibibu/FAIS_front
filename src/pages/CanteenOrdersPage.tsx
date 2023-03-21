import { DataTable } from "mantine-datatable";
import { useEffect, useState } from "react";
import { axiosInstance } from "../axios";
import { Box, Button, Navbar, NavLink } from "@mantine/core";

export const CanteenOrdersPage = () => {
  const token = localStorage.getItem("token");
  const [fetching, setFetching] = useState(true);
  const [classes, setClasses] = useState([]);
  const [orders, setOrders] = useState<any[]>([]);

  const [reportUrl, setReportUrl] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      const response = await axiosInstance.get("/api/Class/GetClasses", {
        headers: { authorization: `Bearer ${token}` },
      });

      // setClasses(() => response.data.data);

      for (const cl of response.data.data) {
        const response_o = await axiosInstance.get(
          `/api/Report/GetByClass?classId=${cl.id}`
        );
        console.log([
          ...new Map(
            [
              ...orders,
              {
                classInfo: cl,
                classOrders: response_o.data.data,
                dishes: response_o.data.data
                  .map((order: any) => order.dishes)
                  .flat(10),
              },
            ].map((item) => [item.id, item])
          ).values(),
        ]);
        
        setOrders((old) => [
          ...new Map(
            [
              ...old,
              {
                classInfo: cl,
                classOrders: response_o.data.data,
                dishes: response_o.data.data
                  .map((order: any) => order.dishes)
                  .flat(10),
              },
            ].map((item) => [item.id, item])
          ).values(),
        ]);
      }
      setFetching(false);
    };
    
    fetchData();
  }, []);
  
  return (
    <Box><a href={`http://212.96.201.66:8000/api/Report/GetExcel/`} download>
      <Button mx={10}>{reportUrl ? 'Скачать' : 'Сформировать общий отчёт'}</Button>
    </a><DataTable
        my={10}
        withBorder
        borderRadius="sm"
        idAccessor="classInfo.id"
        withColumnBorders
        striped
        highlightOnHover
        fetching={fetching}
        columns={[
          { accessor: "classInfo.title", title: "Класс" },
          {
            accessor: "classOrders",
            title: "Количество заказов",
            render: (record) => record.classOrders.length,
          },
          {
            accessor: 'downloadReport', title: 'Отчет', render: record => <a href={`http://212.96.201.66:8000/api/Report/GetExcel/${record.classInfo.id}`} download>
              <Button mx={10}>{reportUrl ? 'Скачать' : 'Сформировать отчёт'}</Button>
            </a>
          }
        ]}
        records={orders}
        rowExpansion={{
          content: ({ record }) => (
            <>
              <Box>
                {record.classOrders
                  .map((order: any) => [...new Set(order.dishIds)]).length > 0 && record.classOrders
                    .map((order: any) => [...new Set(order.dishIds)])
                    .reduce((a: any, b: any) => [...new Set([...a, ...b])])
                    .map((dish: any) => {
                      const item = record.dishes.find((x: any) => x.id === dish);
                      return (
                        <NavLink
                          key={dish}
                          label={`${item.title} (${record.dishes.filter((x: any) => x.id === dish).length
                            }шт.)`}
                        />
                      );
                    })}
              </Box>
            </>
          ),
        }}
      />
    </Box >
  );
};
