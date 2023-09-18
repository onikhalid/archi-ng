import React, { useRef, useContext, useEffect } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { storage } from '@/utils/firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { ThemeContext, UserContext } from '@/utils/ContextandProviders/Contexts';
import { toast } from 'react-toastify';



export default function Edit({ editorRef, setContent, editorContent, type }) {
  const { userData, setUserData, authenticatedUser, loadingauthenticatedUser } = useContext(UserContext);

  const previousContentRef = useRef('')

  // tinymce theme
  const { theme, toggleTheme } = useContext(ThemeContext);
  const tinytheme = theme === 'dark' ? 'oxide-dark' : 'oxide'



  // ///////////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////
  // /////////     Upload IMage, to firebase     //////////////
  // ///////////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////
  const handleImageUpload = async (blobInfo, progress) => {
    const storageRef = ref(storage, `post_images/${authenticatedUser?.uid}/${type}/${blobInfo.filename()}`);

    try {
      const snapshot = await uploadBytes(storageRef, blobInfo.blob(), {
        contentType: blobInfo.blob().type,
        customMetadata: {
          // Add any additional metadata you need for the image
          // For example: author, timestamp, etc.
        },
        onUploadProgress: (snapshot) => {
          const percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          progress(percentage);
        },
      });

      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    }

    catch (error) {
      console.error(error);
      throw new Error("Image upload failed.");
    }
  };



  // ///////////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////
  // //// delete img from editor, then from firebase////////////
  // ///////////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////
  // ///////////////////////////////////////////////////////////
  const handleEditorChange = (content, editor) => {
    setContent(editorRef.current.getContent())
    const previousContent = previousContentRef.current;
    const deletedImage = findDeletedImage(previousContent, content);

    if (deletedImage) {
      // detect Just deleted image 
      const deletedImageUrl = extractImageUrl(deletedImage);

      deleteImageFromDatabase(deletedImageUrl);
    }

    previousContentRef.current = content;
  };

  const findDeletedImage = (previousContent, currentContent) => {
    const previousImages = extractImages(previousContent);
    const currentImages = extractImages(currentContent);

    const deletedImage = previousImages.find(image => !currentImages.includes(image));

    return deletedImage;
  };

  const extractImages = (content) => {
    const imageRegex = /<img[^>]+src="([^"]+)"/g;
    const matches = Array.from(content.matchAll(imageRegex), match => match[0]);

    return matches;
  };

  const extractImageUrl = (image) => {
    const srcRegex = /src="([^"]+)"/;
    const match = image.match(srcRegex);
    return match ? match[1] : null;
  };

  const deleteImageFromDatabase = (imageUrl) => {
    try {
      const startIndex = imageUrl.indexOf('/o/') + 3; // Add 3 to exclude '/o/'
      const endIndex = imageUrl.indexOf('?alt=media');
      const encodedPath = imageUrl.substring(startIndex, endIndex);
      const storagePath = decodeURIComponent(encodedPath);
      const imageRef = ref(storage, storagePath)
      deleteObject(imageRef)
    } catch (error) {
      if (error.code || error.message == "storage/object-not-found") {
        toast.error("Duplicate delete action, image has already been deleted", {
          position: "top-center",
          autoClose: 3500
        })
      }
    }

  };






  return (
    <div>
      <h3>Main Content</h3>
      <Editor
        apiKey='msbbpj95lqonltw1kc7t8dhfszyfrq2eckl4l51v6avn3h5v'
        onInit={(evt, editor) => editorRef.current = editor}
        onEditorChange={(content, editor) => handleEditorChange(content, editor)}
        initialValue={editorContent}
        init={{
          height: 800,
          skin: tinytheme,
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
          ],
          menubar: 'file edit view insert format view table tools ',
          menu: {
            file: { title: 'File', items: 'restoredraft | preview | export print | deleteallconversations' },
            edit: { title: 'Edit', items: 'undo redo | cut copy paste pastetext | selectall | searchreplace' },
            view: { title: 'View', items: 'code | visualaid visualchars visualblocks | spellchecker | preview | showcomments' },
            insert: { title: 'Insert', items: 'image link media addcomment pageembed template codesample inserttable | charmap emoticons hr | pagebreak nonbreaking anchor tableofcontents | insertdatetime' },
            format: { title: 'Format', items: 'bold italic underline strikethrough superscript subscript codeformat | styles blocks align lineheight | language | removeformat' },
            tools: { title: 'Tools', items: 'spellchecker spellcheckerlanguage | a11ycheck code wordcount' },
            table: { title: 'Table', items: 'inserttable | cell row column | advtablesort | tableprops deletetable' },
          },
          toolbar: 'undo redo | blocks link image | ' +
            'bold italic | alignleft aligncenter ' +
            'alignright alignjustify | bullist numlist outdent indent | ' +
            'removeformat',
          block_formats: 'Paragraph=p; Heading 3=h3; Heading 4=h4; Heading 5=h5; Heading 6=h6',
          images_upload_handler: handleImageUpload,
          content_style: `h2{font-family: 'Poppins', 'Arial' , 'Helvetica' , 'sans-serif}` + `body { font-family: 'Lora','Times New Roman', Times, serif; font-size:14px; width:100% }` + 'div { margin: 10px; border: 5px solid red; padding: 3px; }'
        }}
      />
    </div>
  );
}