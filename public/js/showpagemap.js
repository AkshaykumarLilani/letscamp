mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
  container: "map", // container ID
  style: "mapbox://styles/mapbox/streets-v11", // style URL
  center: fullcampground.geometry.coordinates, // starting position [lng, lat]
  zoom: 9, // starting zoom
});

// map.on("style.load", () => {
//   map.setFog({}); // Set the default atmosphere style
// });

new mapboxgl.Marker()
  .setLngLat(fullcampground.geometry.coordinates)
  .setPopup(
    new mapboxgl.Popup({ offset: 25 }).setHTML(
      `<h5>${fullcampground.title}</h5><p>${fullcampground.location}</p>`
    )
  )
  .addTo(map);
map.addControl(new mapboxgl.NavigationControl());
