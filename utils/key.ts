import { useEffect, useRef } from "react";

export default function useKey(key, cb) {
    const callbackRef = useRef(cb);

    useEffect(() => {
        callbackRef.current = cb;
    })

    useEffect(() => {
      const handleKeyPress = (e) => {
        // console.log(e.code + " is pressed")
        if(e.code === key) {
            callbackRef.current(e)
        }
      }

      document.addEventListener("keydown", handleKeyPress)
      return () => document.removeEventListener("keydown", handleKeyPress)
      // "keydown" instead of "keypress" allows us to use ctrl, alt, escape, etc.
    }, [key])
}

export function waitForEl(selector) {
    const input = document.getElementById(selector);
    if (input) {
        input.focus();
    } else {
        setTimeout(function() {
            waitForEl(selector);
        }, 100);
    }
};