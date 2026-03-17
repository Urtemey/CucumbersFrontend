export interface Operator {
  id: string;
  name: string;
  department: string;
}

export const OPERATORS: Operator[] = [
  { id: 'ivan_petrov',       name: 'Иван Петров',       department: 'Отдел качества' },
  { id: 'maria_ivanova',     name: 'Мария Иванова',     department: 'Медицинский отдел' },
  { id: 'alexey_sidorov',    name: 'Алексей Сидоров',   department: 'Технический отдел' },
  { id: 'olga_kuznetsova',   name: 'Ольга Кузнецова',   department: 'Административный отдел' },
  { id: 'elena_volkova',     name: 'Елена Волкова',     department: 'Отдел клиентского сервиса' },
];
