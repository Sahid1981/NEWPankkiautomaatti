#include "accountselect.h"
#include "ui_accountselect.h"
#include "account.h"

#include <QPainter>
#include <QPixmap>

accountselect::accountselect(
    const LoginResultDto& loginResult,
    ApiClient* api,
    QWidget *parent
)
: QDialog(parent)
, ui(new Ui::accountselect)
, m_api(api)
, m_login(loginResult)
{
    ui->setupUi(this);
    
    ui->labelTest->setText("Käyttäjä: " + m_login.idUser);
    
    for (const AccountDto& acc : m_login.accounts) {
        accountIdByType[acc.type.toLower()] = acc.idAccount;
    }
    
    const bool hasDebit  = accountIdByType.contains("debit");
    const bool hasCredit = accountIdByType.contains("credit");
    
    ui->btnSelectDebit->setVisible(hasDebit);
    ui->btnSelectCredit->setVisible(hasCredit);
}

accountselect::~accountselect()
{
    delete ui;
}

void accountselect::on_btnSelectDebit_clicked()
{
    selectedAccountType = "debit";
    openAccountWindow();
}

void accountselect::on_btnSelectCredit_clicked()
{
    selectedAccountType = "credit";
    openAccountWindow();
}

void accountselect::openAccountWindow()
{
    const int idAccount = accountIdByType.value(selectedAccountType, -1);
    if (idAccount < 0) return;
    
    account* accountWindow =
    new account(idAccount, m_api, nullptr);
    
    accountWindow->setAttribute(Qt::WA_DeleteOnClose);
    accountWindow->showMaximized();
    close();
}

void accountselect::paintEvent(QPaintEvent *)
{
    QPainter painter(this);
    QPixmap bg(":/images/background.png");
    painter.drawPixmap(rect(), bg);
}
