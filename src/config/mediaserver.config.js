import Live from "@/models/live.model.js";
import NodeMediaServer from "node-media-server";
import liveSessions from "../../store.js";
import "dotenv/config";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const nms = new NodeMediaServer({
  logType: 3,
  rtmp: {
    port: 1935,
    chunk_size: 60000,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60,
  },
  http: {
    port: 8082,
    mediaroot: "src/media",
    allow_origin: "*",
  },
  trans: {
    ffmpeg: "src/usr/bin/ffmpeg.exe",
    tasks: [
      {
        app: "live",
        hls: true,
        hlsFlags:
          "[hls_time=2:hls_list_size=0:hls_flags=independent_segments:hls_playlist_type=event]",
        dash: false,
        hlsKeep: true,
      },
    ],
  },
});

nms.on("prePublish", async (id, StreamPath, args) => {
  const streamKey = StreamPath.split("/").pop();
  if (liveSessions[streamKey]) {
    let liveSession = liveSessions[streamKey];
    liveSession.status = "live";
    liveSession.urlHlsStream = `${process.env.HTTP_HLS_ORIGIN}/live/${streamKey}/index.m3u8`;
    try {
      const live = await Live.create({
        streamerId: liveSession.streamerId,
        thumbnail: liveSession.thumbnail,
        title: liveSession.title,
        urlHlsStream: liveSession.urlHlsStream,
        urlChatLive: `${process.env.WEBSOCKET_ORIGIN}?cre=${streamKey}`,
        status: liveSession.status,
        tag: liveSession.tag,
      });
      liveSessions[streamKey].liveId = live._id;
      console.log("liveid", liveSessions[streamKey].liveId);
    } catch (error) {
      console.log(error);
    }
  }
});

nms.on("donePublish", async (id, StreamPath, args) => {
  const streamKey = StreamPath.split("/").pop();
  const { liveId } = liveSessions[streamKey];

  const endOfStreamText = "\n#EXT-X-ENDLIST\n";
  const __dirname = path.dirname(fileURLToPath(import.meta.url));

  const m3u8FilePath = path.join(
    __dirname,
    "../",
    "media",
    "live",
    streamKey,
    "index.m3u8"
  );
  try {
    const live = await Live.findById(liveId).exec();
    live.status = "end";
    await live.save();
    fs.appendFileSync(m3u8FilePath, endOfStreamText);
  } catch (error) {
    console.error("Error writing to file:", error);
  }
  //   if (err) {
  //     console.error("Error reading file:", err);
  //     return;
  //   }

  //   const updatedData = data + endOfStreamText;

  //   fs.writeFile(m3u8FilePath, updatedData, "utf8", (err) => {
  //     if (err) {
  //       console.error("Error writing file:", err);
  //     } else {
  //       console.log("Stream end marker added to index.m3u8");
  //     }
  //   });
  // });
});

nms.run();
