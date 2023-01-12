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

  useEffect(() => {
    const fetchClass = async () => {
      const response = await axiosInstance.get(
        `/api/Class/GetTeachersClass?teacherId=${user.id}`,
        { headers: { authorization: `Bearer ${token}` } }
      );
      if (response.data.data !== null)
        setTeacherClass((d) => response.data.data);

      const response_s = await axiosInstance.get(
        `/api/Attendance/GetClassAttendance?classId=${response.data.data.id}`,
        { headers: { authorization: `Bearer ${token}` } }
      );

      if (response_s.data.data !== null)
        setAttendance((d) => response_s.data.data);
      setFetching(false);
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
          if (obj.schoolKidId === response.data.data.schoolKidId)
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
        Посещаемость {teacherClass?.title} на {new Date().toLocaleDateString()}
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
            render: (record) => {
              const cur = attendance.find(
                (a) => a.schoolKidId === record.id
              )?.schoolKidAttendanceType;
              console.log(attendance);
              return (
                <span
                  style={{
                    color:
                      cur === 1 ? "red" : cur === 2 ? "lightgreen" : "black",
                  }}
                >
                  {record.name}
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
                    e.stopPropagation();
                    updateAttendance(record.id, 2);
                  }}
                >
                  <IconCheck size={16} />
                </ActionIcon>

                <ActionIcon
                  color="red"
                  onClick={(e) => {
                    e.stopPropagation();
                    updateAttendance(record.id, 1);
                  }}
                >
                  <IconMinus size={16} />
                </ActionIcon>
              </Group>
            ),
          },
        ]}
        records={teacherClass?.schoolKids}
      />
    </>
  );
};
