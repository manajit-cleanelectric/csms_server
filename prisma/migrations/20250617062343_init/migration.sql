-- CreateTable
CREATE TABLE "charger_types" (
    "type_id" SERIAL NOT NULL,
    "charger_type" TEXT NOT NULL,

    CONSTRAINT "charger_types_pkey" PRIMARY KEY ("type_id")
);

-- CreateTable
CREATE TABLE "tariff_types" (
    "tariff_id" SERIAL NOT NULL,
    "tariff_type" TEXT NOT NULL,
    "tariff_cost" INTEGER NOT NULL,

    CONSTRAINT "tariff_types_pkey" PRIMARY KEY ("tariff_id")
);

-- CreateTable
CREATE TABLE "charge_points" (
    "charge_point_id" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "vendor" TEXT NOT NULL,
    "serial_number" TEXT NOT NULL,
    "firmware_version" TEXT,
    "status" TEXT NOT NULL,
    "last_heartbeat" TIMESTAMP(3) NOT NULL,
    "charger_type_id" INTEGER NOT NULL,
    "tariff_id" INTEGER NOT NULL,

    CONSTRAINT "charge_points_pkey" PRIMARY KEY ("charge_point_id")
);

-- CreateTable
CREATE TABLE "users" (
    "phone_no" TEXT NOT NULL,
    "VEN" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL,
    "has_pending_auth" BOOLEAN NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("phone_no")
);

-- CreateTable
CREATE TABLE "transactions" (
    "transaction_id" TEXT NOT NULL,
    "charge_point_id" TEXT NOT NULL,
    "connector_id" TEXT NOT NULL,
    "VEN" TEXT NOT NULL,
    "start_timestamp" TIMESTAMP(3) NOT NULL,
    "stop_timestamp" TIMESTAMP(3) NOT NULL,
    "meter_start" INTEGER NOT NULL,
    "meter_stop" INTEGER NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("transaction_id")
);

-- CreateTable
CREATE TABLE "meter_values" (
    "id" SERIAL NOT NULL,
    "transaction_id" TEXT NOT NULL,
    "charge_point_id" TEXT NOT NULL,
    "connector_id" TEXT NOT NULL,
    "measurand" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "meter_values_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_VEN_key" ON "users"("VEN");

-- AddForeignKey
ALTER TABLE "charge_points" ADD CONSTRAINT "charge_points_charger_type_id_fkey" FOREIGN KEY ("charger_type_id") REFERENCES "charger_types"("type_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "charge_points" ADD CONSTRAINT "charge_points_tariff_id_fkey" FOREIGN KEY ("tariff_id") REFERENCES "tariff_types"("tariff_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_charge_point_id_fkey" FOREIGN KEY ("charge_point_id") REFERENCES "charge_points"("charge_point_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_VEN_fkey" FOREIGN KEY ("VEN") REFERENCES "users"("VEN") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meter_values" ADD CONSTRAINT "meter_values_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("transaction_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meter_values" ADD CONSTRAINT "meter_values_charge_point_id_fkey" FOREIGN KEY ("charge_point_id") REFERENCES "charge_points"("charge_point_id") ON DELETE RESTRICT ON UPDATE CASCADE;
