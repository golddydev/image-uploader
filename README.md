# image-uploader

This is a script to upload NFT images from local file system to IPFS.

And using upload `CID` make NFT medadata (as `json`) and upload that to IPFS,

to finally get CID for NFT asset.

## How to use this uploader

### Set up environment

```bash
# App
IMAGES_FOLDER_PATH=<absolute-path-to-images-folder-to-upload>

# Pinata

PINATA_JWT=<your-pinata-jwt>
PINATA_GATEWAY_URL=<your-pinata-gateway-url>

# Database
MONGODB_URI=<your-data-base-uri>
```

First you need to set those environment variables up.

Image files must be one of `png`, `jpg`, `jpeg`, `gif`, `webp` and have valid `mime` type.

And size must be smaller than 5MB.

### Database Schema

We use `mongodb` to save all uploaded information to database.

Uploaded information contains file's `path`, `name`, `hash`, `cid`, `url`.

### Run project

```bash
npm start
```

This will run a script to search all images files from `IMAGES_FOLDER_PATH` and upload them to `ipfs`.

### How this script works under the hood?

1. Find all image files in `IMAGE_FOLDER_PATH`.

2. For each file

   - Check file is valid image file using its mime type.

   - Check file is already uploaded using file's `hash`.

   - If it is not uploaded, then upload to `ipfs` and save uploaded information.
