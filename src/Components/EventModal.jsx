import { useState, useEffect } from "react";

const EventModal = ({ date, event, onClose, onSave }) => {
  const [title, setTitle] = useState(event?.title || "");
  const [description, setDescription] = useState(event?.description || "");
  const [time, setTime] = useState(event?.time || "");
  const [color, setColor] = useState(event?.color || "#ef4444");
  const [priority, setPriority] = useState(event?.priority || "medium");

  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDescription(event.description);
      setTime(event.time);
      setColor(event.color);
      setPriority(event.priority);
    }
  }, [event]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Format date as 'YYYY-MM-DD' to avoid timezone shifts
    const formattedDate = date.getFullYear() + "-" +
  String(date.getMonth() + 1).padStart(2, '0') + "-" +
  String(date.getDate()).padStart(2, '0');

    onSave({
      title,
      description,
      date: formattedDate,
      time,
      color,
      priority,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-redcolor focus:ring-redcolor"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-redcolor focus:ring-redcolor"
          rows="3"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Time</label>
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-redcolor focus:ring-redcolor"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Color</label>
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="mt-1 block w-full h-10 rounded-md border-gray-300 shadow-sm focus:border-redcolor focus:ring-redcolor"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Priority</label>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-redcolor focus:ring-redcolor"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-redcolor"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-redcolor border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-redcolor"
        >
          {event ? "Update" : "Create"} Event
        </button>
      </div>
    </form>
  );
};

export default EventModal;
