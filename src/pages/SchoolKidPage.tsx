import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";

export const SchoolkidPage = () => {
  const params = useParams();
  const location = useLocation();
  const token = localStorage.getItem("token");

  const [cameraActive, setCameraActive] = useState(false);

  const handleCameraClick = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraActive(true);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <button onClick={handleCameraClick}>Open Camera</button>
      {cameraActive && <video autoPlay />}
    </div>
  );
};
