import { GeofenceService } from "../geofence.service";

describe("GeofenceService", () => {
  it("returns near-zero distance for same point", () => {
    const service = new GeofenceService();
    const distance = service.distanceMeters(22.5726, 88.3639, 22.5726, 88.3639);
    expect(distance).toBeLessThan(1);
  });

  it("returns non-zero distance for different points", () => {
    const service = new GeofenceService();
    const distance = service.distanceMeters(22.5726, 88.3639, 22.5736, 88.3649);
    expect(distance).toBeGreaterThan(100);
  });
});
