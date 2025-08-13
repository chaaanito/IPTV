import Dexie from "dexie";

export const tv = $state({
  channels: [],
});

export const db = new Dexie("playlist");

db.version(1).stores({
  channels: "++id, name, url ,createAt",
});

export const getChannels = () => db.channels.toArray();

export const addChannel = async (name, url) => {
  const exists = await db.channels.where("url").equals(url).first();
  if (exists) {
    console.warn("Channel already exists:", exists.name);
    return exists.id;
  }

  await db.channels.add({ name, url, createdAt: Date.now() });

  tv.channels = await getChannels();
  return {
    status: "success",
    message: "Channel Added!",
    remainingChannels: await getChannels(),
  };
};

export const deleteChannel = async (id) => {
  try {
    await db.channels.delete(id);
    tv.channels = await getChannels();
    return {
      status: "success",
      message: "Channel deleted!",
      remainingChannels: await getChannels(),
    };
  } catch (error) {
    console.error("Delete error:", error);
    return { status: "error", message: error.message || "Delete failed" };
  }
};
