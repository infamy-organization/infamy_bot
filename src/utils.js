export async function fetchDataFromAPI(url, options = "") {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.text();
    try {
      return JSON.parse(data);
    } catch (error) {
      console.error("Received data is not JSON:", data);
      return "";
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    return null; // Or handle the error differently
  }
}
