import { createClient } from
  "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

// Add your Supabase details here
const SUPABASE_URL = "YOUR_SUPABASE_URL";
const SUPABASE_KEY = "YOUR_PUBLISHABLE_KEY";

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

const gallery = document.getElementById("gallery");
const params = new URLSearchParams(window.location.search);
const eventId = params.get("event");

async function loadGallery() {
  gallery.innerHTML = "<p>Loading photos...</p>";

  if (
    SUPABASE_URL === "YOUR_SUPABASE_URL" ||
    SUPABASE_KEY === "YOUR_PUBLISHABLE_KEY"
  ) {
    gallery.innerHTML =
      "<p>Gallery setup is in progress. Please visit again soon!</p>";
    return;
  }

  try {
    if (!eventId) {
      gallery.innerHTML =
        "<p>Please scan your event QR code to view photos.</p>";
      return;
    }

    const { data: event, error: eventError } =
      await supabase
        .from("events")
        .select("*")
        .eq("id", eventId)
        .single();

    if (eventError) throw eventError;

    document.querySelector("main h2").textContent =
      event.event_name;

    const { data: photos, error: photoError } =
      await supabase
        .from("photos")
        .select("*")
        .eq("event_id", eventId);

    if (photoError) throw photoError;

    gallery.innerHTML = "";

    if (!photos || photos.length === 0) {
      gallery.innerHTML = "<p>No photos uploaded yet.</p>";
      return;
    }

    for (const photo of photos) {
      const { data, error } =
        await supabase.storage
          .from("event-photos")
          .createSignedUrl(photo.file_path, 3600);

      if (error) continue;

      const img = document.createElement("img");
      img.src = data.signedUrl;
      img.alt = "Event photo";
      img.loading = "lazy";

      gallery.appendChild(img);
    }
  } catch (error) {
    console.error(error);
    gallery.innerHTML =
      "<p>Unable to load photos. Please try again.</p>";
  }
}

loadGallery();
