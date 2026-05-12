# Module: Cars (`/cars`)

DTO: `Models/InputModel/Common/Car/`.
ViewModel: `Models/ViewModel/FeatureCore/Car/`.

## Endpoints

| Method | Path | Auth | Request | Response |
|---|---|---|---|---|
| GET | `/cars` | Public | query `CarPagingRequest` | `OperationResult.data = { data, totalCount }` |
| GET | `/cars/{id}` | Public | route `id` | `OperationResult.data = CarReponseDetail` |
| POST | `/cars` | Admin, SuperAdmin | multipart `CarRequest` | `201 OperationResult.data = CarReponse` |
| PUT | `/cars/{id}` | Admin, SuperAdmin | multipart `CarRequest` | `OperationResult.data = CarReponse` |
| GET | `/cars/{id}/tech-spec` | Public | route `id` | `OperationResult.data = CarReponseDetail` |
| POST | `/cars/{id}/tech-spec` | Admin, SuperAdmin | JSON `CarDetailRequest` | `201 OperationResult.data = CarReponseDetail` |
| PATCH | `/cars/{id}/tech-spec` | Admin, SuperAdmin | JSON `CarDetailRequest` | `OperationResult.data = CarReponseDetail` |

## Query: `GET /cars`

`CarPagingRequest` is bound from query string.

| Param | Description |
|---|---|
| pageIndex | Page number |
| pageSize | Page size |
| bodyCode | Optional body type filter |
| brandCode | Optional brand filter |
| priceFrom, priceTo | Optional price range |

The service may use JWT claims when present to decide whether private video URLs can be returned.

## Multipart: `CarRequest`

Main fields: `carCode`, `vin`, `carName`, `brandID`, `modelName`, `modelYear`, `bodyTypeID`, `statusID`, `condition`, `locationID`, `price`, `importPrice`, `salePrice`, `engineSize`, `fuelType`, `transmission`, `driveType`, `doors`, `seats`, `color`, `mileage`, `detailedDescription`, `shortDescription`, `isFeature`, `createdBy`.

Files:

| Field | Rule |
|---|---|
| imageFiles | optional image files, max 10MB each |
| videoFile | optional video file, max 50MB |

## JSON: `CarDetailRequest`

Route `{id}` is the car id. The controller sets `CarDetailRequest.CarID` from the route before calling the service.
