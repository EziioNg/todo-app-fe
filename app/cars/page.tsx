'use client';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  // TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Cars() {
  type Car = {
    id: number;
    category_id: number;
    productName: string;
    price: number;
  };

  const [cars, setCars] = useState<Car[]>([]);

  const getCars = async () => {
    const apiResult = await fetch('http://localhost:3305/cars', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    const cars = await apiResult.json();
    setCars(cars.data);
    console.log('cars received from api: ', cars.data);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    getCars();
  }, []);

  const handleRefresh = () => getCars();

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <div className="flex flex-col min-h-screen w-full max-w-3xl items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <Table>
          <TableCaption>A list of cars.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-25">Id</TableHead>
              <TableHead>CategoryId</TableHead>
              <TableHead>Car Name</TableHead>
              <TableHead className="text-right">Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cars?.map((car) => (
              <TableRow key={car.id}>
                <TableCell className="font-medium">{car.id}</TableCell>
                <TableCell>{car.category_id}</TableCell>
                <TableCell>{car.productName}</TableCell>
                <TableCell className="text-right">{car.price}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Field orientation="horizontal">
          <Button
            type="button"
            className="cursor-pointer"
            onClick={handleRefresh}
          >
            Refresh
          </Button>
          <Link href="/">
            <Button variant="outline" type="button" className="cursor-pointer">
              Return
            </Button>
          </Link>
        </Field>
      </div>
    </div>
  );
}
