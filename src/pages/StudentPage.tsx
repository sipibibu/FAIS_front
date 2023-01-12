import { useLocation, useParams } from "react-router-dom";

export const StudentPage = () => {
  const params = useParams();
  const location = useLocation();
  const token = localStorage.getItem("token");

  return (
    <div>
      <h3>{location.state.kid.name}</h3>
      <span>Роль: {location.state.kid.role}</span>
    </div>
  );
};
