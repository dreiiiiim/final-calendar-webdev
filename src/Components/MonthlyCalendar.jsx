import { useState, useEffect } from "react";
import NavigationControls from "./NavigationControls";
import EventModal from "./EventModal";
import TodoModal from "./TodoModal";
import UserIcon from "./UserIcon"; 
import { supabase } from "./client";


const MonthlyCalendar = () => {


  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const daysOfWeekShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  


  // Set default to May 26, 2025
  const defaultDate = new Date(2025, 4, 26); // Month is 0-indexed (4 = May)
  const currentDate = new Date(); // Actual current date for comparison

  // Define a single 'today' variable at midnight
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [currentMonth, setCurrentMonth] = useState(defaultDate.getMonth());
  const [currentYear, setCurrentYear] = useState(defaultDate.getFullYear());
  const [currentDay, setCurrentDay] = useState(defaultDate.getDate());
  const [viewMode, setViewMode] = useState("month");
  const [events, setEvents] = useState([]);
  const [todos, setTodos] = useState([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showTodoModal, setShowTodoModal] = useState(false);
  const [showAddOptions, setShowAddOptions] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  // Navigation functions
  const prevMonth = () => {
    setCurrentMonth((prev) => (prev === 0 ? 11 : prev - 1));
    setCurrentYear((prev) => (currentMonth === 0 ? prev - 1 : prev));
  };

  const nextMonth = () => {
    setCurrentMonth((prev) => (prev === 11 ? 0 : prev + 1));
    setCurrentYear((prev) => (currentMonth === 11 ? prev + 1 : prev));
  };

  const prevWeek = () => {
    const newDate = new Date(currentYear, currentMonth, currentDay - 7);
    updateDateValues(newDate);
  };

  const nextWeek = () => {
    const newDate = new Date(currentYear, currentMonth, currentDay + 7);
    updateDateValues(newDate);
  };

  const prevDay = () => {
    const newDate = new Date(currentYear, currentMonth, currentDay - 1);
    updateDateValues(newDate);
  };

  const nextDay = () => {
    const newDate = new Date(currentYear, currentMonth, currentDay + 1);
    updateDateValues(newDate);
  };

  const updateDateValues = (date) => {
    setCurrentDay(date.getDate());
    setCurrentMonth(date.getMonth());
    setCurrentYear(date.getFullYear());
  };

  // Helper to format date as YYYY-MM-DD
  const formatDate = (date) => {
    const pad = (n) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  };

  // Helper to get ISO string at midnight UTC
  const getUTCDateISOString = (date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    return d.toISOString();
  };

  // Event management functions
  const handleAddEvent = (date) => {
    // Always pass a Date object to the modal
    const localDate = new Date(date);
    localDate.setHours(0, 0, 0, 0);
    setSelectedDate(localDate);
    setSelectedEvent(null);
    setShowEventModal(true);
    setShowAddOptions(false);
  };

  const handleEditEvent = (event) => {
    // Parse the stored ISO string
    const eventDate = new Date(event.date);
    setSelectedDate(eventDate);
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const handleSaveEvent = async (event) => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('Must be logged in to save events');
      return;
    }

    // Normalize date: ensure it's a string in YYYY-MM-DD format
    let formattedDate = event.date;
    if (event.date instanceof Date) {
      const year = event.date.getFullYear();
      const month = String(event.date.getMonth() + 1).padStart(2, '0');
      const day = String(event.date.getDate()).padStart(2, '0');
      formattedDate = `${year}-${month}-${day}`;
    }

    if (selectedEvent) {
      // Update existing event
      const { error: updateError } = await supabase
        .from('events')
        .update({
          title: event.title,
          description: event.description,
          date: formattedDate,
          time: event.time,
          color: event.color,
          priority: event.priority
        })
        .eq('id', selectedEvent.id);

      if (updateError) throw updateError;

      setEvents(prev =>
        prev.map(e => e.id === selectedEvent.id
          ? { ...event, id: selectedEvent.id, date: formattedDate }
          : e)
      );
    } else {
      // Insert new event
      const { data: newData, error: insertError } = await supabase
        .from('events')
        .insert({
          user_id: user.id,
          title: event.title,
          description: event.description,
          date: formattedDate,
          time: event.time,
          color: event.color,
          priority: event.priority
        })
        .select()
        .single();

      if (insertError) throw insertError;

      setEvents(prev => [...prev, { ...newData, date: formattedDate }]);
    }

    setShowEventModal(false);
  } catch (error) {
    console.error('Error saving event:', error.message);
  }
};


  const handleDeleteEvent = async (eventToDelete) => {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventToDelete.id);

      if (error) throw error;
      setEvents(events.filter(event => event.id !== eventToDelete.id));
    } catch (error) {
      console.error('Error deleting event:', error.message);
    }
  };

  // Todo management functions
  const handleAddTodo = (date) => {
    // Always pass a Date object to the modal
    const localDate = new Date(date);
    localDate.setHours(0, 0, 0, 0);
    setSelectedDate(localDate);
    setShowTodoModal(true);
    setShowAddOptions(false);
  };

  const handleSaveTodo = async (newTodo) => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error("Must be logged in to save todos.");
      return;
    }
    // Always save as ISO string at midnight UTC
    let isoDate = newTodo.date;
    if (newTodo.date instanceof Date) {
      isoDate = getUTCDateISOString(newTodo.date);
    }
    const { data, error } = await supabase.from("todos").insert({
      user_id: user.id,
      date: isoDate,
      title: newTodo.title,
      description: newTodo.description,
      priority: newTodo.priority,
      completed: newTodo.completed,
    }).select();
    if (error) {
      console.error("Error saving todo:", error.message);
    } else {
      setTodos([...todos, { ...data[0], date: isoDate }]);
      setShowTodoModal(false);
    }
  };

 const handleToggleTodo = async (todo) => {
  try {
    const updatedCompleted = !todo.completed;

    const { error } = await supabase
      .from('todos')
      .update({ completed: updatedCompleted })
      .eq('id', todo.id);

    if (error) {
      console.error('Error updating todo:', error);
      return;
    }

    // Update local state
    setTodos(prevTodos => 
      prevTodos.map(t => 
        t.id === todo.id ? { ...t, completed: updatedCompleted } : t
      )
    );
  } catch (err) {
    console.error('Unexpected error updating todo:', err);
  }
};
  

  // Helper functions
  const getWeekNumber = (date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  const getCurrentWeekDays = () => {
    const date = new Date(currentYear, currentMonth, currentDay);
    const dayOfWeek = date.getDay();
    const startDate = new Date(date);
    startDate.setDate(date.getDate() - dayOfWeek);
    
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      return day;
    });
  };

  const isToday = (day) => {
    return (
      day === currentDate.getDate() &&
      currentMonth === currentDate.getMonth() &&
      currentYear === currentDate.getFullYear()
    );
  };

  const isDefaultDate = (day) => {
    return (
      day === 26 &&
      currentMonth === 4 && // May is month 4 (0-indexed)
      currentYear === 2025
    );
  };

  // Filtering helpers for events/todos by day (use UTC)
  const isSameUTCDay = (isoDate, dayObj) => {
    const d = new Date(isoDate);
    return (
      d.getUTCFullYear() === dayObj.getUTCFullYear() &&
      d.getUTCMonth() === dayObj.getUTCMonth() &&
      d.getUTCDate() === dayObj.getUTCDate()
    );
  };

  // Update getDayEvents and dayTodos filters to use isSameUTCDay
  const getDayEvents = (day) => {
    const utcDay = new Date(Date.UTC(day.getFullYear(), day.getMonth(), day.getDate()));
    return events.filter(event => isSameUTCDay(event.date, utcDay));
  };

  // Fetch todos from Supabase
  const fetchTodos = async () => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("Must be logged in to fetch todos.");
      return [];
    }

    const { data, error } = await supabase
      .from("todos")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: true });

    if (error) {
      console.error("Error fetching todos:", error.message);
      return [];
    }

    return data;
  };

  const handleDeleteTodo = async (todo) => {
  try {
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', todo.id);

    if (error) {
      console.error('Error deleting todo:', error);
      return;
    }

    // Update local state after deletion
    setTodos(prevTodos => prevTodos.filter(t => t.id !== todo.id));
  } catch (err) {
    console.error('Unexpected error deleting todo:', err);
  }
};
  // Add useEffect to fetch todos and events when component mounts
  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Fetch todos
        const todosData = await fetchTodos();
        if (todosData) {
          setTodos(todosData);
        }

        // Fetch events
        const { data: events, error } = await supabase
          .from('events')
          .select('*')
          .eq('user_id', user.id);

        if (error) {
          console.error('Error fetching events:', error.message);
        } else {
          setEvents(events);
        }
      }
    };

    fetchData();
  }, []);

  // Simple Calendar View (like in the image)
  const renderSimpleCalendar = () => {
    const monthName = new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long' });
    const year = currentYear;
    
    return (
      <div className="w-90 p-4 bg-dark-black shadow-md mr-3">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-3xl text-white font-semibold">{monthName} <span className="text-redcolor">{year}</span></h3>
          <div className="flex space-x-2">
            <button 
              onClick={prevMonth}
              className="text-white p-1 rounded hover:bg-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button 
              onClick={nextMonth}
              className="text-white p-1 rounded hover:bg-gray-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="text-white grid grid-cols-7 gap-1 text-center text-xs font-medium mb-1">
          {daysOfWeekShort.map(day => (
            <div key={day} className="py-1">{day}</div>
          ))}
        </div>
        
        <div className=" grid grid-cols-7 gap-1">
          {/* Empty cells for days before the first of the month */}
          {[...Array(firstDayOfMonth).keys()].map((_, index) => (
            <div key={`empty-${index}`} className="h-8" />
          ))}
          
          {/* Days of the month */}
          {[...Array(daysInMonth).keys()].map((day) => {
            const dayNumber = day + 1;
            const isCurrentDay = (
              dayNumber === currentDay && 
              viewMode !== "month" && // Only highlight if not in month view
              currentMonth === new Date().getMonth() && 
              currentYear === new Date().getFullYear()
            );
            
            return (
              <div 
                key={dayNumber}
                onClick={() => {
                  setCurrentDay(dayNumber);
                  if (viewMode === "month") setViewMode("day");
                }}
                className={` text-white h-8 flex items-center justify-center rounded-full cursor-pointer text-sm
                  ${isCurrentDay ? 'bg-redcolor text-white' : ''}
                  ${isToday(dayNumber) ? 'border border-redcolor' : ''}
                  ${isDefaultDate(dayNumber) ? 'text-white' : ''}
                  hover:bg-gray-600`}
              >
                {dayNumber}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Sidebar content with events and todos
  const renderSidebarContent = () => {
    // Get today's date at start of day for comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get events for today and future
    const upcomingEvents = events
      .filter(event => {
        // Parse the stored date string (YYYY-MM-DD)
        const [eventYear, eventMonth, eventDay] = event.date.split('-').map(Number);
        const eventDate = new Date(eventYear, eventMonth - 1, eventDay);
        eventDate.setHours(0, 0, 0, 0);
        return eventDate >= today;
      })
      .sort((a, b) => {
        const [aYear, aMonth, aDay] = a.date.split('-').map(Number);
        const [bYear, bMonth, bDay] = b.date.split('-').map(Number);
        const dateA = new Date(aYear, aMonth - 1, aDay);
        const dateB = new Date(bYear, bMonth - 1, bDay);
        return dateA - dateB;
      })
      .slice(0, 5); // Show max 5 upcoming events

    // Get incomplete todos sorted by priority (high first)
    const incompleteTodos = todos
      .filter(todo => !todo.completed)
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      })
      .slice(0, 5); // Show max 5 todos

    return (
  <div className="relative h-full"> {/* Make container relative for absolute children */}
      <div className="mt-4 p-4 text-white overflow-y-auto" style={{ maxHeight: 'calc(100vh - 300px)' }}>
        {/* Upcoming Events Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2 border-b border-gray-700 pb-1 flex justify-between items-center">
            <span>Upcoming Events</span>
            <span className="text-xs font-normal text-gray-400">
              {upcomingEvents.length} {upcomingEvents.length === 1 ? 'event' : 'events'}
            </span>
          </h3>
          {upcomingEvents.length > 0 ? (
            <div className="space-y-3">
              {upcomingEvents.map((event, index) => {
                const eventDate = new Date(event.date);
                const isTodayEvent = eventDate.toDateString() === today.toDateString();
                
                return (
                  <div 
                    key={index} 
                    className="text-sm p-2 bg-dark-black rounded hover:bg-gray-700 cursor-pointer"
                    onClick={() => {
                      // Set the date to event's date and switch to day view
                      updateDateValues(eventDate);
                      setViewMode("day");
                    }}
                  >
                    <div className="flex items-start">
                      <div 
                        className="w-3 h-3 rounded-full mt-1 mr-2 flex-shrink-0" 
                        style={{ backgroundColor: event.color }}
                      />
                      <div className="flex-1">
                        <div className="font-medium">{event.title}</div>
                        <div className="text-xs text-gray-400 flex items-center mt-1">
                          <span>
                            {isTodayEvent ? 'Today' : eventDate.toLocaleDateString('default', { weekday: 'short', month: 'short', day: 'numeric' })}
                            {event.time && ` • ${event.time}`}
                          </span>
                          {event.priority && (
                            <span className={`ml-2 px-1 py-0.5 rounded text-xs ${
                              event.priority === "high" ? "bg-red-900 text-red-100" :
                              event.priority === "medium" ? "bg-yellow-900 text-yellow-100" :
                              "bg-green-900 text-green-100"
                            }`}>
                              {event.priority}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-sm text-gray-400 italic">No upcoming events</div>
          )}
        </div>

        {/* To-Do List Section */}
        <div>
          <h3 className="text-lg font-semibold mb-2 border-b border-gray-700 pb-1 flex justify-between items-center">
            <span>To-Do List</span>
            <span className="text-xs font-normal text-gray-400">
              {incompleteTodos.length} {incompleteTodos.length === 1 ? 'task' : 'tasks'}
            </span>
          </h3>
          {incompleteTodos.length > 0 ? (
            <div className="space-y-3">
              {incompleteTodos.map((todo, index) => {
                const todoDate = todo.date ? new Date(todo.date) : null;
                const isTodayTodo = todoDate && todoDate.toDateString() === today.toDateString();
                
                return (
                  <div 
                    key={index} 
                    className="text-sm p-2 bg-dark-black rounded hover:bg-gray-700 flex items-start"
                  >
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => handleToggleTodo(todo)}
                      className="mt-1 mr-2 flex-shrink-0"
                    />
                    <div className="flex-1">
                      <div className="font-medium">{todo.title}</div>
                      <div className="text-xs text-gray-400 flex items-center mt-1">
                        {todoDate && (
                          <span>
                            {isTodayTodo ? 'Today' : todoDate.toLocaleDateString('default', { weekday: 'short', month: 'short', day: 'numeric' })}
                          </span>
                        )}
                        <span className={`ml-2 px-1 py-0.5 rounded text-xs ${
                          todo.priority === "high" ? "bg-red-900 text-red-100" :
                          todo.priority === "medium" ? "bg-yellow-900 text-yellow-100" :
                          "bg-green-900 text-green-100"
                        }`}>
                          {todo.priority}
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTodo(todo);
                      }}
                      className="ml-2 text-gray-400 hover:text-red-400"
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-sm text-gray-400 italic">No pending tasks</div>
          )}
        </div>
    <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700 bg-dark-black">
              <UserIcon />
        </div>
      </div>
      </div>
    );
  };

  // View renderers
  const renderMonthView = () => {
    const totalCells = Math.ceil((firstDayOfMonth + daysInMonth) / 7) * 7;

    return (
      <div className="flex-1 min-h-0 grid grid-cols-7 gap-1">
        {[...Array(firstDayOfMonth).keys()].map((_, index) => (
          <div key={`empty-${index}`} className="border border-gray-200 rounded-lg bg-white" />
        ))}
        
        {[...Array(daysInMonth).keys()].map((day) => {
          const dayDate = new Date(currentYear, currentMonth, day + 1);
          const dayEvents = getDayEvents(dayDate);
          const dayTodos = todos.filter(todo => {
            const todoDate = new Date(todo.date);
            return (
              todoDate.getDate() === day + 1 &&
              todoDate.getMonth() === currentMonth &&
              todoDate.getFullYear() === currentYear
            );
          });

          return (
            <div
              key={day + 1}
              className={`border border-gray-300 rounded-lg p-1 lg:p-2 hover:bg-gray-200 cursor-pointer transition-colors flex flex-col ${
                isToday(day + 1) ? "bg-blue-50 border-redcolor" : 
                isDefaultDate(day + 1) ? " " : ""
              }`}
              onClick={() => {
                setCurrentDay(day + 1);
                setViewMode("day");
              }}
            >
              <div className="flex justify-between items-start">
                <span className={`text-gray-700 text-sm lg:text-base ${
                  isToday(day + 1) ? "flex items-center justify-center w-6 h-6 lg:w-8 lg:h-8 rounded-full bg-redcolor text-white" :
                  isDefaultDate(day + 1) ? "flex items-center justify-center w-6 h-6 lg:w-8 lg:h-8 rounded-full text-black" : ""
                }`}>
                  {day + 1}
                </span>
              </div>
              
              {dayEvents.length > 0 && (
                <div className="mt-1 space-y-0.5 overflow-hidden">
                  {dayEvents.slice(0, 2).map((event, i) => (
                    <div 
                      key={i} 
                      className="text-[10px] lg:text-xs hover:bg-gray-200 rounded truncate"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentDay(day + 1);
                        setViewMode("day");
                      }}
                    >
                      <span className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full inline-block mr-1" style={{ backgroundColor: event.color }}></span>
                      {event.time} {event.title}
                    </div>
                  ))}
                </div>
              )}
              
              {dayTodos.length > 0 && (
                <div className="mt-1 space-y-0.5 overflow-hidden">
                  {dayTodos.slice(0, 2).map((todo, i) => (
                    <div 
                      key={i} 
                      className="text-[10px] lg:text-xs hover:bg-gray-200 rounded truncate flex items-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentDay(day + 1);
                        setViewMode("day");
                      }}
                    >
                      <span className={`w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full inline-block mr-1 ${
                        todo.priority === "high" ? "bg-red-500" :
                        todo.priority === "medium" ? "bg-yellow-500" : "bg-green-500"
                      }`}></span>
                      {todo.title}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        
        {Array.from({ length: totalCells - (firstDayOfMonth + daysInMonth) }).map((_, i) => (
          <div key={`trailing-empty-${i}`} className="border border-gray-200 rounded-lg bg-white" />
        ))}
      </div>
    );
  };

  const renderWeekView = () => {
    const weekDays = getCurrentWeekDays();

    return (
      <div className="flex-1 min-h-0 grid grid-cols-7 gap-1">
        {weekDays.map((day, index) => {
          const dayEvents = getDayEvents(day);
          const dayTodos = todos.filter(todo => {
            const todoDate = new Date(todo.date);
            return (
              todoDate.getDate() === day.getDate() &&
              todoDate.getMonth() === day.getMonth() &&
              todoDate.getFullYear() === day.getFullYear()
            );
          });

          return (
            <div
              key={index}
              className={`border border-gray-200 rounded-lg p-1 lg:p-2 hover:bg-gray-200 cursor-pointer transition-colors flex flex-col ${
                isToday(day.getDate()) ? "bg-blue-50 border-redcolor" : 
                isDefaultDate(day.getDate()) ? " " : ""
              }`}
              onClick={() => {
                updateDateValues(day);
                setViewMode("day");
              }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className={`text-2xl lg:text-4xl font-semibold mt-1 ${
                    isToday(day.getDate()) ? "flex items-center justify-center w-10 h-10 lg:w-15 lg:h-14 rounded-full bg-redcolor text-white" :
                    isDefaultDate(day.getDate()) ? "flex items-center justify-center w-8 h-8 rounded-full text-black" : ""
                  }`}>
                    {day.getDate()}
                  </div>
                  <div className="text-sm lg:text-lg text-gray-500 mt-1">
                    {day.toLocaleDateString('default', { month: 'short' })}
                  </div>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedDate(day);
                    setShowAddOptions(true);
                  }}
                  className="text-xs p-1 text-gray-500 hover:text-redcolor"
                >
                  +
                </button>
              </div>
              
              <div className="mt-2 space-y-0.5 overflow-hidden">
                {dayEvents.slice(0, 3).map((event, i) => (
                  <div 
                    key={i} 
                    className="text-[10px] lg:text-xs p-1 bg-gray-100 rounded truncate flex items-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      updateDateValues(day);
                      setViewMode("day");
                    }}
                  >
                    <span className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full inline-block mr-1" style={{ backgroundColor: event.color }}></span>
                    {event.time} {event.title}
                  </div>
                ))}
                
                {dayTodos.slice(0, 3).map((todo, i) => (
                  <div 
                    key={`todo-${i}`} 
                    className="text-[10px] lg:text-xs p-1 bg-gray-100 rounded truncate flex items-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      updateDateValues(day);
                      setViewMode("day");
                    }}
                  >
                    <span className={`w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full inline-block mr-1 ${
                      todo.priority === "high" ? "bg-red-500" :
                      todo.priority === "medium" ? "bg-yellow-500" : "bg-green-500"
                    }`}></span>
                    {todo.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderDayView = () => {
    const day = new Date(currentYear, currentMonth, currentDay);
    const dayEvents = getDayEvents(day);
    const dayTodos = todos.filter(todo => {
      const todoDate = new Date(todo.date);
      return (
        todoDate.getDate() === day.getDate() &&
        todoDate.getMonth() === day.getMonth() &&
        todoDate.getFullYear() === day.getFullYear()
      );
    });

    return (
      <div className="flex-1 min-h-0 flex flex-col border border-gray-200 rounded-lg p-2 lg:p-4">
        <div className="flex justify-between items-center">
          <div className="text-2xl lg:text-4xl font-bold mb-4">
            {day.toLocaleDateString('default', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric', 
              year: 'numeric' 
            })}
            {isToday(day.getDate()) && (
              <span className="ml-2 inline-flex items-center justify-center w-16 lg:w-20 h-6 lg:h-8 rounded-full bg-redcolor text-white text-xs lg:text-sm">
                Today
              </span>
            )}
          </div>
          <div className="relative">
            <button 
              onClick={() => setShowAddOptions(!showAddOptions)}
              className="p-1.5 lg:p-2 rounded-full bg-redcolor text-white hover:bg-red-700 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 lg:h-6 lg:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            
            {showAddOptions && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                <div className="py-1">
                  <button
                    onClick={() => {
                      handleAddEvent(day);
                      setShowAddOptions(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Add Event
                  </button>
                  <button
                    onClick={() => {
                      handleAddTodo(day);
                      setShowAddOptions(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Add To-Do
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex-1 min-h-0 space-y-4 lg:space-y-6 overflow-y-auto">
          {/* Events Section */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg lg:text-xl font-semibold">Events</h3>
              <span className="text-xs lg:text-sm text-gray-500">{dayEvents.length} {dayEvents.length === 1 ? 'event' : 'events'}</span>
            </div>
            {dayEvents.length > 0 ? (
              <div className="space-y-2">
                {dayEvents.map((event, index) => (
                  <div 
                    key={index} 
                    className="p-2 lg:p-3 bg-gray-200 rounded-lg hover:bg-gray-100 transition-colors border-l-4" 
                    style={{ borderLeftColor: event.color }}
                  >
                    <div>
                      <h4 className="font-bold text-base lg:text-lg">{event.title}</h4>
                      <div className="flex items-center mt-1 text-xs lg:text-sm text-gray-600">
                        <span className="mr-2">{event.time}</span>
                        {event.priority && (
                          <span className={`px-2 py-0.5 rounded-full text-xs ${
                            event.priority === "high" ? "bg-red-100 text-red-800" :
                            event.priority === "medium" ? "bg-yellow-100 text-yellow-800" :
                            "bg-green-100 text-green-800"
                          }`}>
                            {event.priority}
                          </span>
                        )}
                      </div>
                      {event.description && (
                        <p className="text-xs lg:text-sm text-gray-600 mt-2">{event.description}</p>
                      )}
                    </div>
                    <div className="flex space-x-2 mt-2">
                      <button 
                        onClick={() => handleEditEvent(event)}
                        className="text-xs lg:text-sm text-gray-500 hover:text-blue-500"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteEvent(event)}
                        className="text-xs lg:text-sm text-gray-500 hover:text-red-500"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 lg:p-4 bg-gray-200 rounded-lg text-center text-xs lg:text-sm text-gray-500">
                No events scheduled for this day
              </div>
            )}
          </div>

          {/* Todos Section */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg lg:text-xl font-semibold">To-Dos</h3>
              <span className="text-xs lg:text-sm text-gray-500">{dayTodos.length} {dayTodos.length === 1 ? 'item' : 'items'}</span>
            </div>
            {dayTodos.length > 0 ? (
              <div className="space-y-2">
                {dayTodos.map((todo, index) => (
                  <div 
                    key={index} 
                    className="p-2 lg:p-3 bg-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        checked={todo.completed}
                        onChange={() => handleToggleTodo(todo)}
                        className="mt-1 mr-2 flex-shrink-0"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-sm lg:text-base">{todo.title}</div>
                        <div className="text-xs lg:text-sm text-gray-400 flex items-center mt-1">
                          {todo.priority && (
                            <span className={`px-2 py-0.5 rounded-full text-xs ${
                              todo.priority === "high" ? "bg-red-100 text-red-800" :
                              todo.priority === "medium" ? "bg-yellow-100 text-yellow-800" :
                              "bg-green-100 text-green-800"
                            }`}>
                              {todo.priority}
                            </span>
                          )}
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDeleteTodo(todo)}
                        className="ml-2 text-gray-400 hover:text-red-500"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 lg:h-5 lg:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 lg:p-4 bg-gray-200 rounded-lg text-center text-xs lg:text-sm text-gray-500">
                No to-do items for this day
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <main className="flex flex-col lg:flex-row h-full w-full min-h-0 bg-white">
      {/* Black Sidebar with Simple Calendar and new content - Hidden on mobile */}
      <div className="hidden lg:flex flex-col w-90 bg-dark-black">
        {renderSimpleCalendar()}
        {renderSidebarContent()}
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 h-full min-h-0 flex flex-col">
        <div className="px-4 lg:px-8 pt-4 lg:pt-8 pb-2">
          <NavigationControls
            currentMonth={currentMonth}
            currentYear={currentYear}
            currentWeek={viewMode === "week" ? getWeekNumber(new Date(currentYear, currentMonth, currentDay)) : null}
            currentDay={viewMode === "day" ? currentDay : null}
            viewMode={viewMode}
            onPrev={
              viewMode === "month" ? prevMonth : 
              viewMode === "week" ? prevWeek : 
              prevDay
            }
            onNext={
              viewMode === "month" ? nextMonth : 
              viewMode === "week" ? nextWeek : 
              nextDay
            }
            onViewModeChange={setViewMode}
          />
        </div>
        
        <div className="flex-1 min-h-0 px-4 lg:px-8 pb-4 lg:pb-8 flex flex-col">
          {viewMode !== "day" && (
            <div className="grid grid-cols-7">
              {(viewMode === "month" ? daysOfWeek : daysOfWeekShort).map((day) => (
                <div key={day} className="text-center py-2 text-lg lg:text-3xl font-semibold text-black">
                  {day}
                </div>
              ))}
            </div>
          )}
          
          {viewMode === "month" && renderMonthView()}
          {viewMode === "week" && renderWeekView()}
          {viewMode === "day" && renderDayView()}
        </div>
        {/* Mobile Upcoming Events and To-Do List */}
        <div className="lg:hidden bg-dark-black p-4 space-y-4 mt-30">
          {/* Upcoming Events Section */}
          <div className="bg-dark-black rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3 border-b border-gray-700 pb-2 flex justify-between items-center text-white">
              <span>Upcoming Events</span>
              <span className="text-sm text-gray-400">
                {events.filter(event => {
                  // Parse the stored date string (YYYY-MM-DD)
                  const [eventYear, eventMonth, eventDay] = event.date.split('-').map(Number);
                  const eventDate = new Date(eventYear, eventMonth - 1, eventDay);
                  eventDate.setHours(0, 0, 0, 0);
                  return eventDate >= today;
                }).length} events
              </span>
            </h3>
            <div className="space-y-3">
              {events
                .filter(event => {
                  // Parse the stored date string (YYYY-MM-DD)
                  const [eventYear, eventMonth, eventDay] = event.date.split('-').map(Number);
                  const eventDate = new Date(eventYear, eventMonth - 1, eventDay);
                  eventDate.setHours(0, 0, 0, 0);
                  return eventDate >= today;
                })
                .sort((a, b) => {
                  const [aYear, aMonth, aDay] = a.date.split('-').map(Number);
                  const [bYear, bMonth, bDay] = b.date.split('-').map(Number);
                  const dateA = new Date(aYear, aMonth - 1, aDay);
                  const dateB = new Date(bYear, bMonth - 1, bDay);
                  return dateA - dateB;
                })
                .slice(0, 3)
                .map((event, index) => {
                  const [eventYear, eventMonth, eventDay] = event.date.split('-').map(Number);
                  const eventDate = new Date(eventYear, eventMonth - 1, eventDay);
                  const isTodayEvent = eventDate.toDateString() === today.toDateString();
                  
                  return (
                    <div 
                      key={index} 
                      className="p-3 bg-dark-black rounded-lg hover:bg-gray-600 cursor-pointer"
                      onClick={() => {
                        updateDateValues(eventDate);
                        setViewMode("day");
                      }}
                    >
                      <div className="flex items-start">
                        <div 
                          className="w-3 h-3 rounded-full mt-1 mr-2 flex-shrink-0" 
                          style={{ backgroundColor: event.color }}
                        />
                        <div className="flex-1">
                          <div className="font-medium text-white">{event.title}</div>
                          <div className="text-sm text-gray-300 flex items-center mt-1">
                            <span>
                              {isTodayEvent ? 'Today' : eventDate.toLocaleDateString('default', { weekday: 'short', month: 'short', day: 'numeric' })}
                              {event.time && ` • ${event.time}`}
                            </span>
                            {event.priority && (
                              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                                event.priority === "high" ? "bg-red-900 text-red-100" :
                                event.priority === "medium" ? "bg-yellow-900 text-yellow-100" :
                                "bg-green-900 text-green-100"
                              }`}>
                                {event.priority}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* To-Do List Section */}
          <div className="bg-dark-black rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3 border-b border-gray-700 pb-2 flex justify-between items-center text-white">
              <span>To-Do List</span>
              <span className="text-sm text-gray-400">
                {todos.filter(todo => !todo.completed).length} tasks
              </span>
            </h3>
            <div className="space-y-3">
              {todos
                .filter(todo => !todo.completed)
                .sort((a, b) => {
                  const priorityOrder = { high: 3, medium: 2, low: 1 };
                  return priorityOrder[b.priority] - priorityOrder[a.priority];
                })
                .slice(0, 3)
                .map((todo, index) => {
                  const todoDate = todo.date ? new Date(todo.date) : null;
                  const isTodayTodo = todoDate && todoDate.toDateString() === today.toDateString();
                  
                  return (
                    <div 
                      key={index} 
                      className="p-3 bg-dark-black rounded-lg hover:bg-gray-600 flex items-start"
                    >
                      <input
                        type="checkbox"
                        checked={todo.completed}
                        onChange={() => handleToggleTodo(todo)}
                        className="mt-1 mr-2 flex-shrink-0"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-white">{todo.title}</div>
                        <div className="text-sm text-gray-300 flex items-center mt-1">
                          {todoDate && (
                            <span>
                              {isTodayTodo ? 'Today' : todoDate.toLocaleDateString('default', { weekday: 'short', month: 'short', day: 'numeric' })}
                            </span>
                          )}
                          {todo.priority && (
                            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                              todo.priority === "high" ? "bg-red-900 text-red-100" :
                              todo.priority === "medium" ? "bg-yellow-900 text-yellow-100" :
                              "bg-green-900 text-green-100"
                            }`}>
                              {todo.priority}
                            </span>
                          )}
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDeleteTodo(todo)}
                        className="ml-2 text-gray-400 hover:text-red-400"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <EventModal
              date={selectedDate}
              event={selectedEvent}
              onClose={() => setShowEventModal(false)}
              onSave={handleSaveEvent}
            />
          </div>
        </div>
      )}
      
      {showTodoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <TodoModal
              date={selectedDate}
              onClose={() => setShowTodoModal(false)}
              onSave={handleSaveTodo}
            />
          </div>
        </div>
      )}
    </main>
  );
};

export default MonthlyCalendar;