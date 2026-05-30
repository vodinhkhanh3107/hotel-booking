import { useEffect, useMemo, useState } from "react";
import { App as AntApp } from "antd";
import { RoomApiClient } from "../services/apiClient";
import { getDetailBill } from "../helpers/getDetailBill";

export default function useCalculateOrder(id_room,dates,setDates) {
  
  const [room, setRoom] = useState({});
  const [promotions, setPromotion] = useState([]);
  const [selectedDiscount, setSelectedDiscount] = useState({
    code: "",
    discount_percent: "",
    id: "",
  });

  useEffect(() => {
    const fetchApiRoom = async () => {
      const res = await RoomApiClient.getDetailRoom(id_room);
      console.log(res);
      if (res.status === 200) {
        console.log(res);
        setRoom(res.room);
        setPromotion(res.promotions);
      }
    };

    fetchApiRoom();
  }, [id_room]);

  const billingDetails = useMemo(() => {
    return getDetailBill(dates, room, selectedDiscount);
  }, [dates, room, selectedDiscount]);
  console.log(billingDetails);

  return {
    dates,
    room,
    selectedDiscount,
    setDates,
    setSelectedDiscount,
    promotions,
    billingDetails
  };
}
