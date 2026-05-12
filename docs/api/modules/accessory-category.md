# Module: Accessories and Categories (`/accessories`, `/categories`)

## Accessories

| Method | Path | Auth | Request | Response |
|---|---|---|---|---|
| GET | `/accessories` | Public | query `AccessoriesPagingRequest` | `AccessoriesPagedResponse` |
| GET | `/accessories/{id}` | Public | route `id` | `AcessoriesReponse` |
| POST | `/accessories` | Admin, SuperAdmin, Staff | multipart `AccessoriesRequest` | `201` created accessory |
| PUT | `/accessories/{id}` | Admin, SuperAdmin, Staff | multipart `AccessoriesRequest` | updated accessory |

### Query: `GET /accessories`

| Param | Description |
|---|---|
| page | page number, default 1 |
| pageSize | 1 to 100 |
| categoryID | optional category filter |
| brandAccessoryID | optional brand accessory filter |
| priceFrom, priceTo | optional price range |
| sortBy | optional sort field |
| sortDescending | optional boolean |

### Multipart: `AccessoriesRequest`

Main fields: `accessoryCode`, `accessoryName`, `description`, `price`, `categoryID`, `brandAccessoryID`, `compatibleCarModels`, `costPrice`, `stockQuantity`, `minStockLevel`, `maxStockLevel`, `warrantyMonths`, `createdBy`.

Files:

| Field | Rule |
|---|---|
| imagePath | optional image, max 5MB |
| installationVideo | optional video, max 50MB |

## Categories

| Method | Path | Auth | Request | Response |
|---|---|---|---|---|
| GET | `/categories` | Public | none | `OperationResult.data = category[]` |
| GET | `/categories/{id}` | Public | route `id` | `OperationResult.data = category` |
| POST | `/categories` | Admin, SuperAdmin, Staff | JSON `CategoryRequest` | `201 OperationResult.data = category` |
| PUT | `/categories/{id}` | Admin, SuperAdmin, Staff | JSON `CategoryRequest` | `OperationResult.data = category` |
