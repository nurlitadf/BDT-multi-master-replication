<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

/**
 * Class CreateOrdersTable.
 */
class CreateOrdersTable extends Migration
{
	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('orders', function(Blueprint $table) {
			$table->increments('id');
			$table->integer('user_id')->unsigned();
			$table->integer('restaurant_id')->unsigned();
			$table->mediumText('comments')->nullable();
			$table->bigInteger('total');
			$table->integer('status')->default(0);
            $table->timestamps();
		});
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		Schema::drop('orders');
	}
}
