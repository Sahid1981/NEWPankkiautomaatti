#include "adminwindow.h"
#include "accountsdata.h"
#include "carddata.h"
#include "logs.h"
#include "ui_adminwindow.h"
#include "userdata.h"
#include <QProcess>
#include <qpainter.h>

adminwindow::adminwindow(QString user, QWidget *parent)
    : QWidget(parent)
    , ui(new Ui::adminwindow),
    user(user)
{
    ui->setupUi(this);
    ui->labelAdminUser->setText("Adminkäyttäjä: "+user);
    ui->stackedAdmin->setCurrentWidget(ui->screenAsiakkaat);

    connect(ui->labelTiliID, &QLineEdit::returnPressed, this, &adminwindow::on_btnLokitHae_clicked);

    //testidataa
    testUserData = R"([
    {"iduser": "1", "fname": "Aku", "lname": "Ankka", "streetaddress": "Paratiisitie 13"},
    {"iduser": "2", "fname": "Roope", "lname": "Ankka", "streetaddress": "Rahasäiliö 1"},
    {"iduser": "3", "fname": "Mikki", "lname": "Hiiri", "streetaddress": "Jokikatu 43"},
    {"iduser": "4", "fname": "Hessu", "lname": "Hopo", "streetaddress": "Koivukatu 7"}
    ])";

    testAccountsData = R"([
    {"idaccount": 1, "iduser": "1", "balance": 500, "credilimit": 0},
    {"idaccount": 2, "iduser": "2", "balance": 1000000, "creditlimit": 0},
    {"idaccount": 3, "iduser": "2", "balance": 10000, "creditlimit": 50000},
    {"idaccount": 4, "iduser": "3", "balance": 25000, "creditlimit": 0},
    {"idaccount": 5, "iduser": "3", "balance": 250, "creditlimit": 1500},
    {"idaccount": 6, "iduser": "4", "balance": 1000, "creditlimit": 0}
    ])";

    testCardData = R"([
    {"idcard": "1", "cardPIN": "$2b$10$nS6H0mXIsmR8S.r6Yp89neMv5.7.8JmQ6mGzO8Z6V6H8N6f6Y6e6q", "iduser": "1", "is_locked": false},
    {"idcard": "2", "cardPIN": "$2b$10$Eixza975pS8En6Z6v6f6uef6u6e6u6e6u6e6u6e6u6e6u6e6u6e6u", "iduser": "2", "is_locked": false},
    {"idcard": "3", "cardPIN": "$2b$10$K7L9M0N1O2P3Q4R5S6T7U8V9W0X1Y2Z3A4B5C6D7E8F9G0H1I2J3K", "iduser": "3", "is_locked": false},
    {"idcard": "4", "cardPIN": "$2b$10$K7L9M0N1O2P3Q4R5S6f6uef6u6e6u6e6A4BzO8Z6V6H8G0H1I.7.8", "iduser": "4", "is_locked": true}
    ])";

    testLogData = R"([
    {"idlog": 1, "time": "2026-01-18 12:00", "balancechange": -20.50},
    {"idlog": 2, "time": "2026-01-18 12:05", "balancechange": 100.00},
    {"idlog": 3, "time": "2026-01-18 13:30", "balancechange": -5.00},
    {"idlog": 4, "time": "2026-01-18 14:15", "balancechange": -12.80},
    {"idlog": 5, "time": "2026-01-18 15:00", "balancechange": 2450.00},
    {"idlog": 6, "time": "2026-01-18 16:45", "balancechange": -65.20},
    {"idlog": 7, "time": "2026-01-19 08:30", "balancechange": -4.50},
    {"idlog": 8, "time": "2026-01-19 09:12", "balancechange": -110.00},
    {"idlog": 9, "time": "2026-01-19 11:50", "balancechange": 15.00},
    {"idlog": 10, "time": "2026-01-19 13:20", "balancechange": -22.15},
    {"idlog": 11, "time": "2026-01-19 17:05", "balancechange": -45.00},
    {"idlog": 12, "time": "2026-01-20 10:00", "balancechange": -3.20},
    {"idlog": 13, "time": "2026-01-20 12:30", "balancechange": 50.00},
    {"idlog": 14, "time": "2026-01-20 15:45", "balancechange": -200.00},
    {"idlog": 15, "time": "2026-01-20 18:20", "balancechange": -8.90}
    ])";

    userData = new userdata(this);
    ui->tableUserData->setModel(userData->getModel());
    userData->setUserData(testUserData);

    accountsData = new accountsdata(this);
    ui->tableAccountsData->setModel(accountsData->getModel());
    accountsData->setAccountsData(testAccountsData);

    cardData = new carddata(this);
    ui->tableCardData->setModel(cardData->getModel());
    cardData->setCardData(testCardData);

    logData = new logs(this);
    ui->tableLokit->setModel(logData->getModel());
    logData->setLog(testLogData);

    ui->tableUserData->horizontalHeader()->setSectionResizeMode(0, QHeaderView::Fixed);
    ui->tableUserData->setColumnWidth(0, 80);
    ui->tableUserData->horizontalHeader()->setSectionResizeMode(1, QHeaderView::Fixed);
    ui->tableUserData->setColumnWidth(1, 100);
    ui->tableUserData->horizontalHeader()->setSectionResizeMode(2, QHeaderView::Fixed);
    ui->tableUserData->setColumnWidth(2, 100);
    ui->tableUserData->horizontalHeader()->setSectionResizeMode(3, QHeaderView::Stretch);

    ui->tableAccountsData->horizontalHeader()->setSectionResizeMode(0, QHeaderView::Fixed);
    ui->tableAccountsData->setColumnWidth(0, 80);
    ui->tableAccountsData->horizontalHeader()->setSectionResizeMode(0, QHeaderView::Fixed);
    ui->tableAccountsData->setColumnWidth(1, 80);
    ui->tableAccountsData->horizontalHeader()->setSectionResizeMode(2, QHeaderView::Stretch);
    ui->tableAccountsData->horizontalHeader()->setSectionResizeMode(3, QHeaderView::Stretch);

    ui->tableCardData->horizontalHeader()->setSectionResizeMode(0, QHeaderView::Fixed);
    ui->tableCardData->setColumnWidth(0, 80);
    ui->tableCardData->horizontalHeader()->setSectionResizeMode(1, QHeaderView::Stretch);
    ui->tableCardData->horizontalHeader()->setSectionResizeMode(2, QHeaderView::Fixed);
    ui->tableCardData->setColumnWidth(2, 80);
    ui->tableCardData->horizontalHeader()->setSectionResizeMode(3, QHeaderView::Fixed);
    ui->tableCardData->setColumnWidth(3, 80);

    ui->tableLokit->horizontalHeader()->setSectionResizeMode(0, QHeaderView::Fixed);
    ui->tableLokit->setColumnWidth(0, 50);
    ui->tableLokit->horizontalHeader()->setSectionResizeMode(1, QHeaderView::Stretch);
    ui->tableLokit->horizontalHeader()->setSectionResizeMode(2, QHeaderView::Stretch);

}

adminwindow::~adminwindow()
{
    delete ui;
}

//adminruudun tausta, jälleen sama
void adminwindow::paintEvent(QPaintEvent *event)
{
    QPainter painter(this);
    static const QPixmap selectPix(":/images/backgroundLogin.png");
    painter.drawPixmap(rect(), selectPix);
}


void adminwindow::on_btnAsiakkaatLowBar_clicked()
{
    ui->stackedAdmin->setCurrentWidget(ui->screenAsiakkaat);
}


void adminwindow::on_btnTilitLowBar_clicked()
{
    ui->stackedAdmin->setCurrentWidget(ui->screenTilit);
}


void adminwindow::on_btnKortitLowBar_clicked()
{
    ui->stackedAdmin->setCurrentWidget(ui->screenKortit);
}


void adminwindow::on_btnLokitHae_clicked()
{

}


void adminwindow::on_btnLokitLowBar_clicked()
{
    ui->stackedAdmin->setCurrentWidget(ui->screenLokit);
    ui->labelTiliID->setFocus();
}


void adminwindow::on_btnLogOutLowBar_2_clicked()
{
    //Hard reset
    //StartDetached = kokonaan irtonainen, uusi sovellus
    //applicationFilePath = Tämän sovelluksen sijainnista
    //{} = startDetached function vaatii argumentit että ajaa oikein, annetaan tyhjä
    QProcess::startDetached(QCoreApplication::applicationFilePath(), {});
    qApp->quit();   //sulkee tämän version sovelluksesta
}

