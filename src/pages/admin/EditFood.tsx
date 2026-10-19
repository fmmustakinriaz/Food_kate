import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchFoodById } from '@/lib/api';
import type { Food } from '@/types';
import FoodForm from './FoodForm';

export default function EditFood() {
  const { id } = useParams<{ id: string }>();
  const [food, setFood] = useState<Food | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetchFoodById(id)
      .then(setFood)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="container-page py-10"><div className="skeleton h-96 rounded-2xl" /></div>;
  return <FoodForm editing={food} />;
}
