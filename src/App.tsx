/* eslint-disable max-len */
import React, { useEffect, useState } from 'react';
import 'bulma/css/bulma.css';
import '@fortawesome/fontawesome-free/css/all.css';

import { TodoList } from './components/TodoList';
import { TodoFilter } from './components/TodoFilter';
import { TodoModal } from './components/TodoModal';
import { Loader } from './components/Loader';
import { getTodos, getUser } from './api';
import { Todo } from './types/Todo';
import { User } from './types/User';

export type Category = 'all' | 'active' | 'completed';

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);

  const [loaderTodo, setLoaderTodo] = useState(false);
  const [loaderUser, setLoaderUser] = useState(false);

  const [category, setCategory] = useState<Category>('all');
  const [query, setQuery] = useState<string>('');

  useEffect(() => {
    async function loadTodos() {
      setLoaderTodo(true);

      try {
        const todosFromServer = await getTodos();

        setTodos(todosFromServer);
      } catch (error) {
        throw error;
      } finally {
        setLoaderTodo(false);
      }
    }

    loadTodos();
  }, []);

  useEffect(() => {
    async function loadUser() {
      if (selectedTodo) {
        setLoaderUser(true);
        try {
          const userFromServer = await getUser(selectedTodo.userId);

          setUser(userFromServer);
        } catch (error) {
          throw error;
        } finally {
          setLoaderUser(false);
        }
      }
    }

    loadUser();
  }, [selectedTodo]);

  const filterTodo = (
    todosList: Todo[],
    {
      filterCategory,
      filterQuery,
    }: { filterCategory: Category; filterQuery: string },
  ): Todo[] => {
    let filteredTodo = [...todosList];

    if (filterCategory === 'completed') {
      filteredTodo = filteredTodo.filter(todo => todo.completed);
    }

    if (filterCategory === 'active') {
      filteredTodo = filteredTodo.filter(todo => !todo.completed);
    }

    if (filterQuery) {
      const normalizedQuery = filterQuery.toLowerCase().trim();

      filteredTodo = filteredTodo.filter(todo =>
        todo.title.toLowerCase().includes(normalizedQuery),
      );
    }

    return filteredTodo;
  };

  const visibleTodo = filterTodo(todos, {
    filterCategory: category,
    filterQuery: query,
  });

  return (
    <>
      <div className="section">
        <div className="container">
          <div className="box">
            <h1 className="title">Todos:</h1>

            <div className="block">
              <TodoFilter
                query={query}
                category={category}
                onQueryChange={setQuery}
                onCategoryChange={setCategory}
              />
            </div>

            <div className="block">
              {loaderTodo && <Loader />}
              <TodoList
                todos={visibleTodo}
                selectedTodo={selectedTodo}
                onSelect={setSelectedTodo}
              />
            </div>
          </div>
        </div>
      </div>
      {selectedTodo && (
        <TodoModal
          loaderUser={loaderUser}
          selectedTodo={selectedTodo}
          user={user}
          onModalClose={setSelectedTodo}
        />
      )}
    </>
  );
};
