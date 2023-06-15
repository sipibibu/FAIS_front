import { useEffect, useState } from "react";
import { axiosInstance } from "../axios";
import jwtDecode from "jwt-decode";
import { IDish } from "../types";
import { DataTable } from "mantine-datatable";
import { Box, Button, NavLink } from "@mantine/core";
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
  const [orders, setOrders] = useState<any>({});
  const [menus, setMenus] = useState<any>([]);

  useEffect(() => {
    const fetchKids = async () => {
      
      const result = await axiosInstance.get(`/api/Account/GetPerson?personId=${user.personId}`, {
        headers: { authorization: `Bearer ${token}` },
      });
      let parse_result=JSON.parse(result.data.data)
      

      const result_m = await axiosInstance.get("/api/Menu");
      let result_m_parse=result_m.data.data.map((qwe: string)  => JSON.parse(qwe))


      setMenus(result_m_parse);

      const localKids = parse_result.SchoolKids.filter((x:any) => x);
      setKids(localKids);
      if (localKids.length > 0) {
        for (const kid of localKids) {
          console.log(kid.Id)
          const result = await axiosInstance.get(`/GetSchoolKidsOrders?schoolKidId=${kid.Id}`);
          console.log(result)
          let result_parse = result.data.data.map((qwe: string) => JSON.parse(qwe));
          console.log(JSON.stringify(result_parse))

          console.log(result_parse);
        
          setOrders((old: any) => ({
            ...old,
            [kid.Id]: [
              ...new Map([...(old[kid.Id] || []), ...result_parse].map((item) => [item.Id, item])).values(),
            ],
          }));
        }
      }


    };
    fetchKids();
  }, []);


  return (
    <>
      {kids.map((kid: any) => {
        return (
          <div key={kid.Id}>
            <h3>{kid.Name}</h3>
            <DataTable
              fontSize="xl"
              my={10}
              withBorder
              borderRadius="sm"
              idAccessor="classInfo.id"
              withColumnBorders
              striped
              highlightOnHover
              columns={[
              { accessor: "number", title: "№", render: (record, key) => key + 1 },  
              {accessor: "menuTitle",title: "Меню",render: (record: any) => menus.find((m: any) => m.Id === record.MenuId)?.Title},
              { 
                accessor: "dateorder",
                title: "Дата",
                render: (record: any) => {
                  const dates = record.Dates || []; // Проверяем наличие массива Dates и устанавливаем пустой массив, если он не существует
                  return dates.map((date: any, index: number) => {
                    const parsedDate = new Date(date);
                    if (isNaN(parsedDate.getTime())) {
                      return null; // Возвращаем null, если дата некорректна
                    }
                    return <div key={index}>{parsedDate.toLocaleDateString("ru-RU")}</div>;
                  });
                }
              }
                          
              ]}
              records={orders[kid.Id] || []}
              rowExpansion={{
                content: ({ record }: any) => {
                  return (
                    <>
                      {record.DishesIds.map((did: any) => (
                        <NavLink
                          key={did}
                          label={
                            menus.find((m: any) => m.Id === record.MenuId)?.Dishes.find(
                              (d: any) => d.Id === did
                            )?.Title
                          }
                        />
                        
                      ))}
                    </>
                  );
                },
              }}
            />
          </div>
        );
      })}
    </>
  );
  
};
