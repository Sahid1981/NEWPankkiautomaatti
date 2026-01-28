#include "adminwindow.h"
#include "accountsdata.h"
#include "carddata.h"
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

    userData = new userdata(this);
    ui->tableUserData->setModel(userData->getModel());
    userData->setUserData(testUserData);

    accountsData = new accountsdata(this);
    ui->tableAccountsData->setModel(accountsData->getModel());
    accountsData->setAccountsData(testAccountsData);

    cardData = new carddata(this);
    ui->tableCardData->setModel(cardData->getModel());
    cardData->setCardData(testCardData);
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

