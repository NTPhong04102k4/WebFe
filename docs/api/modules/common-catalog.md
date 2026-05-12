# Module: Common Catalog (`/common`)

This module exposes shared lookup data: brands, accessory brands, body types, and locations.

## Brands

| Method | Path | Auth | Request | Response |
|---|---|---|---|---|
| GET | `/common/brands` | Public | none | `OperationResult.data = brand[]` |
| POST | `/common/brands` | Admin, SuperAdmin | multipart `BrandRequest` | `201 OperationResult.data = brand` |
| PUT | `/common/brands/{brandCode}` | Admin, SuperAdmin | multipart `BrandRequest` | `OperationResult.data = brand` |

`brandCode` is the natural key used by the service.

## Accessory Brands

| Method | Path | Auth | Request | Response |
|---|---|---|---|---|
| GET | `/common/brand-accessories` | Public | none | `OperationResult.data = brandAccessory[]` |
| POST | `/common/brand-accessories` | Admin, SuperAdmin | multipart `BrandAccessoryRequest` | `201 OperationResult.data = brandAccessory` |
| PUT | `/common/brand-accessories/{name}` | Admin, SuperAdmin, Staff | multipart `BrandAccessoryRequest` | `OperationResult.data = brandAccessory` |

`name` is the natural key used by the current service.

## Body Types

| Method | Path | Auth | Request | Response |
|---|---|---|---|---|
| GET | `/common/bodytypes` | Public | none | `OperationResult.data = bodyType[]` |
| POST | `/common/body-types` | Admin, SuperAdmin | multipart `BodyCarRequest` | `201 OperationResult.data = bodyType` |
| PUT | `/common/body-types/{bodyCode}` | Admin, SuperAdmin | multipart `BodyCarUpdateRequest` | `OperationResult.data = bodyType` |

`bodyCode` is the natural key used by the service.

## Locations

| Method | Path | Auth | Request | Response |
|---|---|---|---|---|
| GET | `/common/location?ip={ip}` | Public | query `ip` | `OperationResult.data = location` |
| GET | `/common/locations` | Public | none | `OperationResult.data = location[]` |
