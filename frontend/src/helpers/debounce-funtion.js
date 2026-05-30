export function debounce(func, delay) {
    let timeoutId;

    return function (...args) {
      // Clear the existing timer if the function is called again within the delay period
      clearTimeout(timeoutId);

      // Set a new timer
      timeoutId = setTimeout(() => {
        // Execute the original function with the correct context and arguments
        func.apply(this, args);
      }, delay);
    };
  }