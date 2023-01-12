import { BrowserRouter, Route, Routes } from "react-router-dom";
import { MenusPage, LoginPage, DishPage } from "./pages";
import { RecoilRoot, useRecoilState, useRecoilValue } from "recoil";
import { MantineProvider } from "@mantine/core";
import { NotificationsProvider } from "@mantine/notifications";
import { NavbarWrapper } from "./components";
import { ModalsProvider } from "@mantine/modals";
import { DishesPage } from "./pages/DishesPage";
import { ParentsPage } from "./pages/ParentsPage";
import { StudentsPage } from "./pages/StudentsPage";
import { StudentPage } from "./pages/StudentPage";
import { OrdersPage } from "./pages/OrdersPage";
import { TeachersPage } from "./pages/TeachersPage";
import { AttendancePage } from "./pages/AttendancePage";
import { ClassesPage } from "./pages/ClassesPage";
import { CanteenOrdersPage } from "./pages/CanteenOrdersPage";
import { EmployeesPage } from "./pages/EmployeesPage";

function App() {
  return (
    <MantineProvider withNormalizeCSS withGlobalStyles>
      <NotificationsProvider>
        <RecoilRoot>
          <ModalsProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<NavbarWrapper />}>
                  <Route path="menus" element={<MenusPage />} />
                  <Route path="dishes" element={<DishesPage />} />
                  <Route path="dishes/:dishId" element={<DishPage />} />
                  <Route path="teachers" element={<TeachersPage />} />
                  <Route path="classes" element={<ClassesPage />} />
                  <Route path="parents" element={<ParentsPage />} />
                  <Route path="students" element={<StudentsPage />} />
                  <Route path="students/:studentId" element={<StudentPage />} />
                  <Route path="orders" element={<OrdersPage />} />
                  <Route path="attendance" element={<AttendancePage />} />
                  <Route path="canteen" element={<CanteenOrdersPage />} />
                  <Route path="employees" element={<EmployeesPage />} />
                </Route>
                <Route path="/login" element={<LoginPage />} />
              </Routes>
            </BrowserRouter>
          </ModalsProvider>
        </RecoilRoot>
      </NotificationsProvider>
    </MantineProvider>
  );
}

export default App;
