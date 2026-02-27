package com.matchup.controller;

import com.matchup.dto.CreateLocationRequest;
import com.matchup.model.Location;
import com.matchup.model.Room;
import com.matchup.service.LocationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.xml.sax.Locator;

import java.util.List;

@RestController
@RequestMapping("/api")
public class LocationController {
    @Autowired
    private LocationService locationService;

    @GetMapping("/v1/locations")
    public ResponseEntity<List<Location>> getAllLocations(){
        return ResponseEntity.ok(this.locationService.getAllLocations());
    }

    @GetMapping("/v1/locations/{id}")
    public ResponseEntity<Location> getLocationById(@PathVariable int id){
        return ResponseEntity.ok(this.locationService.getLocationById(id));
    }

    @PostMapping("/v1/locations")
    public ResponseEntity<Location> createLocation(@RequestBody CreateLocationRequest createLocationRequest){
        Location location = new Location();
        location.setAddress(createLocationRequest.getAddress());
        location.setDistrict(createLocationRequest.getDistrict());
        location.setRegion(createLocationRequest.getRegion());

        return ResponseEntity.ok(this.locationService.addLocation(location));
    }

    @DeleteMapping("/v1/locations/{id}")
    public ResponseEntity<?> deleteLocation(@PathVariable int id){
        Location location = this.locationService.getLocationById(id);
        this.locationService.deleteLocation(location);

        return ResponseEntity.ok("Delete Location Successfully");
    }
}
