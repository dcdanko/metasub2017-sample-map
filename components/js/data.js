//add URl path (string), a 'live' status (bool)

export const processCitiesData = rawData => {
  const cleanedData = rawData.map(rawCity => {
    const cleanCity = Object.assign({}, rawCity);
    if (cleanCity.id !== ""){
      cleanCity.path = `https://metasub-kobo-wrapper.herokuapp.com/${cleanCity.id}`;
      cleanCity.live = true;
    }else{
      cleanCity.live = false;
    }
    return cleanCity;
  });
  return cleanedData;
};