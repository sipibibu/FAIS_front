import { useEffect, useState } from "react";
import { axiosInstance } from "../axios";
import jwtDecode from "jwt-decode";
import { IDish } from "../types";
import { DataTable } from "mantine-datatable";
import { Box, NavLink } from "@mantine/core";
import {
  IconFriends,
  IconListCheck,
  IconLogout,
  IconMenuOrder,
  IconMoodKid,
  IconSchool,
  IconSoup,
  IconToolsKitchen,
  IconToolsKitchen2,
  IconUser,
  IconUsers,
} from "@tabler/icons";
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
      const localKids = result.data.data.filter((x:any) => x);
      
      setKids(result.data.data.filter((x:any) => x));

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
            { accessor: "menuTitle", title: "Меню", render: (record:any) => menus.find((m:any) => m.id === record.menuId)?.title },
          ]}
          records={orders}
          rowExpansion={{
            content: ({ record }:any) => {
              //console.log(record)
              return (
                <>
                  {record.dishIds.map((did:any) =>
                    <NavLink label={menus.find((m:any) => m.id === record.menuId).dishes.find((d:any) => d.id === did)?.title} />)}
                </>
              )
            }
          }}
        />
      </>
    );
  });
};
