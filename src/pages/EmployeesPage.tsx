import { useEffect, useState } from "react";
import { axiosInstance } from "../axios";
import { ActionIcon, Box, Button, Group, NavLink, Table, TextInput } from "@mantine/core";
import { closeAllModals, openModal } from "@mantine/modals";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { IconEdit, IconTrash } from "@tabler/icons";
import { DataTable } from "mantine-datatable";

export const EmployeesPage = () => {
  const token: string | null = localStorage.getItem("token");
  const [employees, setEmployees] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    const fetchEmployees = async () => {
      const data = await axiosInstance.get("/api/Account/GetCanteenEmployees", {
        headers: { authorization: `Bearer ${token}` },
      });
      setEmployees(data.data.data);
      setFetching(false)
    };

    fetchEmployees();
  }, []);

  const deleteEmployee = async (employeeId: string) => {
    const data = await axiosInstance.delete(`/api/Account/DeleteCanteenEmployee?id=${employeeId}`, { headers: { authorization: `Bearer ${token}` } })

    if (data.data.statusCode === 200) {
      showNotification({
        title: "Успешно",
        message: `Сотрудник удален`,
        color: "teal",
      });

      setEmployees((old) => old.filter((s: any) => s.id !== employeeId));

      closeAllModals();
    } else {
      showNotification({
        title: "Произошла ошибка",
        message: "Произошла неизвестная ошибка",
        color: "red",
      });
    }
  }

  const CreateEmployeeModal = () => {
    const form = useForm({
      initialValues: {
        name: "",
      },
    });

    const createEmployee = async () => {
      const result = await axiosInstance.post(
        `/api/Account/Register`,
        {
          name: form.values.name,
          role: "canteenEmployee",
        },
        { headers: { authorization: `Bearer ${token}` } }
      );

      if (result.status === 200) {
        setEmployees([...employees,result.data.data.person])
        showNotification({
          title: "Успешно",
          message: `Данные для входа: ${result.data.data.login}:${result.data.data.password} `,
          autoClose: false,
          color: "teal",
        });

        closeAllModals();
      } else {
        showNotification({
          title: "Произошла ошибка",
          message: "Произошла неизвестная ошибка",
          color: "red",
        });
      }
    };

    return (
      <form onSubmit={form.onSubmit(createEmployee)}>
        <TextInput
          label="Имя"
          placeholder="Имя"
          data-autofocus
          value={form.values.name}
          onChange={(event) =>
            form.setFieldValue("name", event.currentTarget.value)
          }
        />
        <Button type="submit" fullWidth mt="md">
          Создать
        </Button>
      </form>
    );
  };

  const UpdateEmployeeModal = (props: any) => {
    const form = useForm({
      initialValues: {
        name: props.employee.name,
      },
    });

    const updateEmployee = async () => {
      const result = await axiosInstance.put(
        `/api/Account/UpdateCanteenEmployee?id=${props.employee.id}`,
        {
          name: form.values.name,
          role: 'canteenEmployee'
        },
        { headers: { authorization: `Bearer ${token}` } }
      );

      if (result.data.statusCode === 200) {
        console.log(employees)
        console.log(result.data.data)
        let index_element=employees.findIndex(dish=>dish.id ==result.data.data.id)
        employees[index_element]=result.data.data
        setEmployees([...employees])
        showNotification({
          title: "Успешно",
          message: `Данные обновлены`,
          autoClose: false,
          color: "teal",
        });

        closeAllModals();
      } else {
        showNotification({
          title: "Произошла ошибка",
          message: "Произошла неизвестная ошибка",
          color: "red",
        });
      }
    };

    return (
      <form onSubmit={form.onSubmit(updateEmployee)}>
        <TextInput
          label="Имя"
          placeholder="Имя"
          data-autofocus
          value={form.values.name}
          onChange={(event) =>
            form.setFieldValue("name", event.currentTarget.value)
          }
        />
        <Button
          type="submit"
          fullWidth
          // onClick={() => updateParentKids(props.parent.id)}
          mt="md"
        >
          Сохранить
        </Button>
      </form>
    );
  };

  return (
    <>
      <Button
        onClick={() =>
          openModal({
            title: "Создание сотрудника",
            children: <CreateEmployeeModal />,
          })
        }
        my={10}
      >
        Создать
      </Button>
      <DataTable
        withBorder
        borderRadius="sm"
        withColumnBorders
        minHeight={100}
        striped
        highlightOnHover
        fetching={fetching}
        columns={[
          // { accessor: "id", title: "ID" },
          {
            accessor: "id",
            title: "ID",
          },
          {
            accessor: "name",
            title: "Имя",
            width: 400,

          },
          {
            accessor: "role",
            title: "Роль",
          },
          {
            accessor: "actions",
            title: "Действия",
            render: (record) => (
              <Group spacing={4} position="apart">
                <ActionIcon
                  color="blue"
                  onClick={(e) => {
                    e.stopPropagation();
                    openModal({
                      title: "Редактирование сотрудника",
                      children: <UpdateEmployeeModal employee={record} />,
                    });
                  }}
                >
                  <IconEdit size={16} />
                </ActionIcon>

                <ActionIcon
                  color="red"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteEmployee(record.id)
                  }}
                >
                  <IconTrash size={16} />
                </ActionIcon>
              </Group>
            ),
          },
        ]}
        records={employees}
      />
    </>
  );
};
