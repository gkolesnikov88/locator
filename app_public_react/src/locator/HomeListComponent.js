import React, {useState, useEffect} from 'react';

function HomeListComponent() {
  const apiBaseUrl = 'http://localhost:3000/api';
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    const lng = -0.7992599;
    const lat = 51.378091;
    const maxDistance = 20;
    const url = `${apiBaseUrl}/locations?lng=${lng}&lat=${lat}&maxDistance=${maxDistance}`;
    fetch(url)
      .then(response => response.json())
      .then(locations => setLocations(locations));
  }, [])

  const formatDistance = (distance) => {
    let thisDistance = 0;
    let unit = ' m';
    if (distance > 1000) {
      thisDistance = parseFloat(distance / 1000).toFixed(1);
      unit = ' km';
    } else {
      thisDistance = Math.floor(distance);
    }
    return thisDistance + unit;
  };

  return (
    locations.map(location => { return (
    <div className="card"  key={location.id}>
      <div className="card-block">
        <h4>
          <a href={`/location/${location.id}`}>{location.name}</a>
          <small>&nbsp;
            <i className={`fa${location.rating < 1 ? 'r' : 's'} fa-star`}></i>
            <i className={`fa${location.rating < 2 ? 'r' : 's'} fa-star`}></i>
            <i className={`fa${location.rating < 3 ? 'r' : 's'} fa-star`}></i>
            <i className={`fa${location.rating < 4 ? 'r' : 's'} fa-star`}></i>
            <i className={`fa${location.rating < 5 ? 'r' : 's'} fa-star`}></i>
          </small>
          <span className="badge badge-pill badge-default float-right">{formatDistance(location.distance)}</span>
        </h4>
        <p className="address">{location.address}</p>
        <div className="facilities">
          {location.facilities.map((facility, index) => {
            return <span className="badge badge-warning" key={location.id + index}>{facility}</span>;
          })}
        </div>
      </div>
    </div>)})
  );
}

export default HomeListComponent;
