import { useEffect, useState } from "react";
import { axiosInstance } from "../axios";
import jwtDecode from "jwt-decode";
import { IDish } from "../types";
import { DataTable } from "mantine-datatable";
import { Box, NavLink } from "@mantine/core";

export const OrdersPage = () => {
  const token = localStorage.getItem("token")!;
  const user: any = jwtDecode(token);
  const [kids, setKids] = useState<any>([]);
  const [orders, setOrders] = useState<any>([]);
  const [menus, setMenus] = useState<any>([]);

  useEffect(() => {
    const fetchKids = async () => {
      const data = await axiosInstance.get("/api/Menu");
      setMenus(data.data.data);

      const result = await axiosInstance.get(
        `/api/Account/GetTrustesSchoolKids?trusteeId=${user.id}`
      );
      const localKids = result.data.data.filter(x => x);
      setKids(result.data.data.filter(x => x));

      if (localKids.length > 0) {
        for (const kid of localKids) {
          const result = await axiosInstance.get(
            `/api/Menu/GetSchoolKidsOrders?schoolKidId=${kid.id}`
          );
          setOrders((old: any) => [
            ...new Map(
              [...old, ...result.data.data].map((item) => [item.id, item])
            ).values(),
          ]);
        }
      }


    };
    fetchKids();
  }, []);

  return kids.map((kid: any) => {
    return (
      <>
        {/* <h3>{kid.name}</h3> */}
        <DataTable
          my={10}
          withBorder
          borderRadius="sm"
          idAccessor="classInfo.id"
          withColumnBorders
          striped
          highlightOnHover
          // fetching={fetching}
          columns={[
            { accessor: "kidName", title: "Имя", width: 300, render: record => kid.name },
            { accessor: "menuTitle", title: "Меню", render: (record) => menus.find(m => m.id === record.menuId).title },
          ]}
          records={orders}
          rowExpansion={{
            content: ({ record }) => {
              console.log(record)
              return (
                <>
                  {record.dishIds.map(did =>
                    <NavLink label={menus.find(m => m.id === record.menuId).dishes.find(d => d.id === did).title} />)}
                </>
              )
            }
          }}
        />
      </>
    );
  });
};
