import { useRef, useState } from "react";
import { UploadCloud, CheckCircle, X } from "lucide-react";
import { Progress } from "../ui/progress";
import { Button } from "../ui/button";

export function CarImageUploader() {

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [error, setError] = useState("");



  function handleFile(selectedFile: File) {

    setError("");

    if (!selectedFile.type.startsWith("image/")) {
      setError("Only image files are allowed");
      return;
    }


    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("Image must be below 5MB");
      return;
    }



    // remove previous preview memory
    if (preview) {
      URL.revokeObjectURL(preview);
    }



    const imageUrl = URL.createObjectURL(selectedFile);


    setFile(selectedFile);
    setPreview(imageUrl);
    setProgress(0);
    setUploaded(false);

  }





  function handleDrop(event: React.DragEvent<HTMLDivElement>) {

    event.preventDefault();


    const droppedFile = event.dataTransfer.files[0];


    if (droppedFile) {
      handleFile(droppedFile);
    }

  }





  function removeImage() {

    if (preview) {
      URL.revokeObjectURL(preview);
    }


    setFile(null);
    setPreview("");
    setProgress(0);
    setUploading(false);
    setUploaded(false);
    setError("");



    // reset input so same image can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

  }





  function simulateUpload() {

    if (!file) return;


    setUploading(true);
    setUploaded(false);


    let value = 0;



    const timer = setInterval(() => {


      value += 10;


      setProgress(value);



      if (value >= 100) {

  clearInterval(timer);

  setUploading(false);

  setUploaded(true);


  // clear image after successful upload
  setTimeout(() => {

    if (preview) {
      URL.revokeObjectURL(preview);
    }


    setFile(null);
    setPreview("");
    setProgress(0);
    setUploaded(false);


    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }


  }, 2000);

}



    }, 300);

  }







  return (

    <div className="rounded-xl border bg-card p-6 space-y-5">


      <div>

        <h2 className="text-xl font-bold">
          Upload Car Photos
        </h2>


        <p className="text-sm text-muted-foreground">
          Add vehicle images for your inventory listing
        </p>

      </div>





      {/* EMPTY STATE */}

      {!preview && (

        <div
          onDragOver={(e)=>e.preventDefault()}
          onDrop={handleDrop}
          className="
            border-2
            border-dashed
            rounded-xl
            p-12
            text-center
            cursor-pointer
            hover:bg-muted
            transition
          "
        >


          <UploadCloud
            size={45}
            className="mx-auto mb-4"
          />



          <p className="font-medium">
            Drag image here
          </p>


          <p className="text-sm text-muted-foreground">
            or choose from your computer
          </p>




          <Button
            type="button"
            className="mt-5"
            onClick={() => fileInputRef.current?.click()}
          >
            Choose Image
          </Button>



          <input
            ref={fileInputRef}
            type="file"
            hidden
            accept="image/*"
            onChange={(event)=>{

              const selectedFile =
                event.target.files?.[0];


              if(selectedFile){
                handleFile(selectedFile);
              }

            }}
          />


        </div>

      )}








      {/* PREVIEW STATE */}

      {preview && (

        <div
          className="
            relative
            rounded-xl
            border
            p-4
            space-y-4
          "
        >




          <div
            className="
              flex
              justify-between
              items-start
              gap-4
            "
          >


            <div className="min-w-0">


              <p className="
                font-medium
                truncate
              ">
                {file?.name}
              </p>



              <p className="text-sm text-muted-foreground">

                {file &&
                  `${(file.size / 1024 / 1024).toFixed(2)} MB`
                }

              </p>


            </div>





            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={removeImage}
              disabled={uploading}
            >

              <X size={20}/>

            </Button>



          </div>







          <img
            src={preview}
            alt="Vehicle preview"
            className="
              h-64
              w-full
              rounded-lg
              object-cover
            "
          />







          {!uploading && !uploaded && (

            <div className="flex justify-end">


              <Button
                onClick={simulateUpload}
              >

                Upload Image

              </Button>


            </div>

          )}








          {uploading && (

            <div className="space-y-2">


              <p className="text-sm">
                Uploading image... {progress}%
              </p>



              <Progress value={progress}/>


            </div>

          )}








          {uploaded && (

            <div
              className="
                flex
                items-center
                gap-2
                text-green-600
                font-medium
              "
            >

              <CheckCircle size={20}/>

              Image uploaded successfully

            </div>

          )}



        </div>

      )}







      {error && (

        <p className="text-sm text-red-500">
          {error}
        </p>

      )}



    </div>

  );

}