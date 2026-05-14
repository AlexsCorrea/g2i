import React from "react";
import { useNavigate } from "react-router-dom";
import { KioskDeviceSelect } from "@/components/kiosk/KioskDeviceSelect";
import { setSelectedDeviceId } from "@/hooks/useTotem";

export default function KioskSelect() {
  const navigate = useNavigate();

  const handleSelect = (deviceId: string) => {
    setSelectedDeviceId(deviceId);
    navigate("/kiosk");
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "linear-gradient(135deg,#1e5a8a,#0f3460)" }}
    >
      <div className="w-full max-w-3xl">
        <KioskDeviceSelect onSelect={handleSelect} />
      </div>
    </div>
  );
}
