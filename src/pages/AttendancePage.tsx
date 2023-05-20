import { useEffect, useState } from "react";
import { axiosInstance } from "../axios";
import { useRecoilState, useRecoilValue } from "recoil";
import { userAtom } from "../store";
import { DataTable } from "mantine-datatable";
import { ActionIcon, Group } from "@mantine/core";
import { closeAllModals, openModal } from "@mantine/modals";
import {
  IconCheck,
  IconEdit,
  IconMacro,
  IconMinimize,
  IconMinus,
  IconPlus,
  IconQuestionMark,
  IconTrash,
} from "@tabler/icons";
import { showNotification } from "@mantine/notifications";
import jwtDecode from "jwt-decode";

export const AttendancePage = () => {
  const token: string = localStorage.getItem("token")!;
  const user: any = jwtDecode(token);
  const [teacherClass, setTeacherClass] = useState<any>(null);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [kid, setKid] = useState<any[]>([])
  useEffect(() => {
    const fetchClass = async () => {
      const response = await axiosInstance.get(
        `/api/Class/GetTeachersClass?teacherId=${user.personId}`,
        { headers: { authorization: `Bearer ${token}` } }
      );
        

      let response_parse=JSON.parse(response.data.data)
      if (response_parse !== null)
        setTeacherClass(response_parse);

      const response_s = await axiosInstance.get(
        `/api/Attendance/GetClassAttendance?classId=${JSON.parse(response.data.data).Id}`,
        { headers: { authorization: `Bearer ${token}` } }
      );
      
      if (response_s.data.data !== null)
        setAttendance(response_s.data.data);
      setFetching(false);


      const response_kid = await axiosInstance.get("/api/Account/GetPersons?role=schoolKid", {
        headers: { authorization: `Bearer ${token}` },
      });
      const response_kid_parse = response_kid.data.data.map((qwe: string)  => JSON.parse(qwe));
      setKid(response_kid_parse)
    };
    fetchClass();
  }, []);
  
  const updateAttendance = async (studentId: string, type: number) => {
    const response = await axiosInstance.put(
      `/api/Attendance/Put?id=${studentId}&attendance=${type}`
    );
      
    if (response.data.statusCode === 200) {
      showNotification({
        title: "Успешно",
        message: "Информация обновлена",
        color: "teal",
      });

      setAttendance((prev: any[]) => {
        const newState = prev.map((obj) => {
          if (obj.id === response.data.data.id)
            return { ...obj, ...response.data.data };
          return obj;
        });
        return newState;
      });

      // setAttendance([...attendance, response.data.data]);
    } else {
      showNotification({
        title: "Произошла ошибка",
        message: "Произошла неизвестная ошибка",
        color: "red",
      });
    }
  };
  return (
    <>
      <span>
        Посещаемость {teacherClass?.Title} на {new Date().toLocaleDateString()}
      </span>
      <DataTable
        withBorder
        borderRadius="sm"
        withColumnBorders
        striped
        highlightOnHover
        fetching={fetching}
        columns={[
          { accessor: "number", title: "№", render: (record, key) => key + 1 },
          {
            accessor: "name",
            title: "Имя",
            width: 400,
            render: (record:any) => {
              const kid_name = kid.find(kid => kid.Id === record);
              const kid_att = attendance.find(kid => kid.id == record)
              console.log(kid_att)
              
              return (
                <span
                  style={{
                    color:
                    kid_att?.attendance === 1 ? "red" : kid_att?.attendance === 2 ? "lightgreen" : "black",
                  }}
                >
                  {kid_name?.Name}
                </span>
              );
            },
          },
          {
            accessor: "actions",
            title: "Действия",
            render: (record) => (
              <Group spacing={4} position="apart">
                <ActionIcon
                  color="teal"
                  onClick={(e) => {
                    console.log(record)
                    e.stopPropagation();
                    updateAttendance(record, 2);
                  }}
                >
                  <IconCheck size={16} />
                </ActionIcon>

                <ActionIcon
                  color="red"
                  onClick={(e) => {
                    e.stopPropagation();
                    updateAttendance(record, 1);
                  }}
                >
                  <IconMinus size={16} />
                </ActionIcon>
              </Group>
            ),
          },
        ]}
        
        records={teacherClass?.SchoolKidIds}
      />
    </>
  );
};
