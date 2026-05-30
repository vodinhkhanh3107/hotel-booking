import { useState } from "react";
import { debounce } from "../helpers/debounce-funtion";

export default function useHandleSearch () {
    const [textSearch,setTextSearch] = useState("");
    const handleSearch = debounce((e) => {
    setTextSearch(e.target.value.toLowerCase())
  },500);
    return {
        textSearch,
        setTextSearch,
        handleSearch
    }
}